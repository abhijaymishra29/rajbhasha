import { ADMIN_TARGET_EMAIL } from '../data/defaultData';

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
  sharedWithAdmin: boolean;
}

/**
 * Searches or creates the designated Rajbhasha folder in Google Drive
 */
export async function getOrCreateRajbhashaFolder(accessToken: string): Promise<string | null> {
  try {
    const folderName = 'राजभाषा_प्रतिवेदन_पटना_Zonal_Office';
    const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Official Rajbhasha Reports folder linked to Admin: ${ADMIN_TARGET_EMAIL}`,
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id;
    }
  } catch (err) {
    console.warn('Could not create or find Drive folder, saving to root:', err);
  }
  return null;
}

/**
 * Uploads a file with metadata directly to Google Drive via multipart upload
 */
export async function uploadFileToGoogleDrive({
  file,
  title,
  category,
  monthOrQuarter,
  branchOrOffice,
  uploadedBy,
  accessToken,
}: {
  file: File;
  title: string;
  category: string;
  monthOrQuarter: string;
  branchOrOffice: string;
  uploadedBy: string;
  accessToken: string;
}): Promise<DriveUploadResult> {
  // Try to find or create destination folder
  const folderId = await getOrCreateRajbhashaFolder(accessToken);

  const metadata: Record<string, unknown> = {
    name: `${title}_${file.name}`,
    description: `राजभाषा प्रतिवेदन / रिपोर्ट - श्रेणी: ${category}, अवधि: ${monthOrQuarter}, प्रेषक: ${uploadedBy}, कार्यालय: ${branchOrOffice}, गंतव्य: ${ADMIN_TARGET_EMAIL}`,
    properties: {
      category,
      monthOrQuarter,
      branchOrOffice,
      uploadedBy,
      targetAdminEmail: ADMIN_TARGET_EMAIL,
    },
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  // Create multipart boundary
  const boundary = '-------rajbhasha_boundary_' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const metadataContentType = 'application/json; charset=UTF-8';
  const fileContentType = file.type || 'application/octet-stream';

  const metadataPart = delimiter +
    `Content-Type: ${metadataContentType}\r\n\r\n` +
    JSON.stringify(metadata);

  const fileHeader = `\r\n--${boundary}\r\n` +
    `Content-Type: ${fileContentType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n`;

  // Base64 encode the binary data
  let binary = '';
  const bytes = new Uint8Array(fileArrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  const multipartBody = metadataPart + fileHeader + base64Data + closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
  }

  const fileData = await uploadRes.json();
  let sharedWithAdmin = false;

  // Share file with admin email (abhijaycbi@gmail.com) if the current uploader is not already that admin
  try {
    const shareRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'user',
        emailAddress: ADMIN_TARGET_EMAIL,
      }),
    });

    if (shareRes.ok) {
      sharedWithAdmin = true;
    }
  } catch (shareErr) {
    console.warn(`Could not automatically share with ${ADMIN_TARGET_EMAIL}:`, shareErr);
  }

  return {
    fileId: fileData.id,
    name: fileData.name,
    webViewLink: fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`,
    webContentLink: fileData.webContentLink,
    sharedWithAdmin,
  };
}

/**
 * List files from the Rajbhasha folder or files matching Rajbhasha properties
 */
export async function listRajbhashaDriveFiles(accessToken: string) {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,createdTime,size)&orderBy=createdTime desc',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
  } catch (err) {
    console.warn('Notice fetching files from Google Drive:', err);
  }
  return [];
}

/**
 * Formats registered users into a structured Google Sheet / CSV table
 */
export function getPasswordSheetContent(users: any[]): string {
  const header = 'क्र.सं.,क्षेत्र (Region),अधिकारी का नाम (Officer Name),पदनाम (Designation),उपयोक्ता आईडी / ईमेल (User ID/Email),पासवर्ड (Password),पंजीकरण दिनांक एवं समय (Registration Date),संबद्ध ड्राइव (Target Drive)\n';
  
  if (!users || users.length === 0) {
    return header + `1,प्रशासक खाता (Admin),अभिजाय कुमार,मुख्य प्रबंधक (राजभाषा),admin@rajbhasha.in,Admin@Patna#CBI800,2026-09-01 10:00:00,${ADMIN_TARGET_EMAIL}\n`;
  }

  const rows = users.map((u, idx) => {
    const sNo = idx + 1;
    const reg = (u.regionHindi || u.region || 'सामान्य').replace(/,/g, ' ');
    const name = (u.name || 'उपयोक्ता').replace(/,/g, ' ');
    const desig = (u.designation || 'राजभाषा प्रभारी').replace(/,/g, ' ');
    const email = (u.emailOrUsername || u.email || '').replace(/,/g, ' ');
    const pwd = (u.password || '').replace(/,/g, ' ');
    const date = (u.createdAt ? new Date(u.createdAt).toLocaleString('hi-IN') : '2026-09-04').replace(/,/g, ' ');
    return `${sNo},${reg},${name},${desig},${email},${pwd},${date},${ADMIN_TARGET_EMAIL}`;
  });

  return header + rows.join('\n');
}

/**
 * Triggers a browser download of the password Google Sheet / CSV file
 */
export function downloadPasswordSheet(users: any[]) {
  const csvContent = '\uFEFF' + getPasswordSheetContent(users); // Add BOM for Excel UTF-8 Hindi compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rajbhasha_user_credentials.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Saves or updates the password registry spreadsheet file named
 * "password for abhijaycbi@gmail.com" in Google Drive
 */
export async function syncPasswordSheetToGoogleDrive(
  accessToken: string | null,
  users: any[]
): Promise<{ success: boolean; fileId?: string; webViewLink?: string; message: string }> {
  const csvData = getPasswordSheetContent(users);
  
  // Cache in local storage
  localStorage.setItem('rajbhasha_password_sheet', csvData);

  if (!accessToken) {
    return {
      success: true,
      message: 'क्रेडेंशियल स्प्रेडशीट में स्थानीय रूप से सुरक्षित सहेज लिया गया है।',
    };
  }

  try {
    const fileName = `password for ${ADMIN_TARGET_EMAIL}`;
    
    // Check if file already exists in Drive
    const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let existingFileId: string | null = null;
    let existingViewLink: string | null = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        existingFileId = searchData.files[0].id;
        existingViewLink = searchData.files[0].webViewLink;
      }
    }

    if (existingFileId) {
      // Update existing file content
      const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/csv; charset=UTF-8',
        },
        body: '\uFEFF' + csvData,
      });

      if (updateRes.ok) {
        return {
          success: true,
          fileId: existingFileId,
          webViewLink: existingViewLink || `https://drive.google.com/file/d/${existingFileId}/view`,
          message: `गूगल ड्राइव पर '${fileName}' स्प्रेडशीट सफलतापूर्वक अद्यतन (Update) कर दी गई है।`,
        };
      }
    } else {
      // Create new file in designated folder or root
      const folderId = await getOrCreateRajbhashaFolder(accessToken);
      const metadata: Record<string, unknown> = {
        name: fileName,
        description: `क्षेत्रीय उपयोक्ताओं के पासवर्ड एवं क्रेडेंशियल स्प्रेडशीट • ${ADMIN_TARGET_EMAIL}`,
        mimeType: 'text/csv',
      };
      if (folderId) {
        metadata.parents = [folderId];
      }

      const boundary = '-------passwordsheet_boundary_' + Math.random().toString(36).substring(2);
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadataPart = delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata);

      const fileHeader = `\r\n--${boundary}\r\n` +
        'Content-Type: text/csv; charset=UTF-8\r\n\r\n';

      const multipartBody = metadataPart + fileHeader + '\uFEFF' + csvData + closeDelimiter;

      const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      });

      if (createRes.ok) {
        const fileInfo = await createRes.json();
        return {
          success: true,
          fileId: fileInfo.id,
          webViewLink: fileInfo.webViewLink || `https://drive.google.com/file/d/${fileInfo.id}/view`,
          message: `गूगल ड्राइव पर '${fileName}' फ़ाइल सफलतापूर्वक सहेज दी गई है।`,
        };
      }
    }
  } catch (err) {
    console.warn('Google Drive password sheet sync error:', err);
  }

  return {
    success: true,
    message: 'क्रेडेंशियल स्प्रेडशीट में सुरक्षित रूप से दर्ज कर लिया गया है।',
  };
}
