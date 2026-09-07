import React, { useState, useRef } from 'react';
import { AuthUser, UploadedReport } from '../types';
import { uploadFileToGoogleDrive } from '../services/driveService';
import { 
  Upload, 
  X, 
  FileText, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Paperclip,
  Check,
  Calendar,
  Building,
  User as UserIcon,
  HardDrive
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  googleAccessToken: string | null;
  onUploadSuccess: (report: UploadedReport) => void;
  onConnectGoogle: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  googleAccessToken,
  onUploadSuccess,
  onConnectGoogle,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('monthly_report');
  const [monthOrQuarter, setMonthOrQuarter] = useState('सितंबर 2026 (September 2026)');
  const [branchOrOffice, setBranchOrOffice] = useState('आंचलिक कार्यालय पटना (Zonal Office Patna)');
  const [officerName, setOfficerName] = useState(currentUser?.name || 'राजभाषा प्रभारी');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const allCategories = [
    { id: 'monthly_report', hindi: 'मासिक प्रतिवेदन (आर.वी. 1 / Monthly Report)', allowedForUser: true },
    { id: 'quarterly_report', hindi: 'तिमाही प्रगति रिपोर्ट (QPR - Quarterly Progress Report)', allowedForUser: true },
    { id: 'rv_format', hindi: 'आर. वी. प्रारूप (R.V. Format Report)', allowedForUser: false },
    { id: 'annual_programme', hindi: 'वार्षिक कार्यक्रम अनुपालन (Annual Programme Compliance)', allowedForUser: false },
    { id: 'circular', hindi: 'परिपत्र एवं अधिसूचना (Circular & Notification)', allowedForUser: false },
    { id: 'hindi_workshop', hindi: 'हिंदी कार्यशाला प्रतिवेदन (Hindi Workshop Report)', allowedForUser: false },
    { id: 'tolic', hindi: 'नराकास (TOLIC) बैठक कार्यवृत्त', allowedForUser: false },
    { id: 'emagazine', hindi: 'ई-पत्रिका आलेख / रचना (E-Magazine Content)', allowedForUser: false },
  ];

  // User is ONLY allowed to upload monthly and quarterly reports! Remaining is for admin only.
  const categories = isAdmin ? allCategories : allCategories.filter((c) => c.allowedForUser);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!title) {
        // Auto-fill title from filename
        const baseName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(baseName);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      if (!title) {
        setTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('कृपया अपलोड करने हेतु एक फ़ाइल चुनें (Please select a file to upload).');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(20);

    const reportId = 'rep-' + Date.now();
    const matchedCategory = categories.find((c) => c.id === category)?.hindi || category;

    try {
      let driveResult = null;
      let driveSyncStatus: 'synced' | 'pending' | 'local_only' = 'local_only';

      // If Google OAuth access token is active, upload directly to Google Drive!
      if (googleAccessToken) {
        setUploadProgress(45);
        try {
          driveResult = await uploadFileToGoogleDrive({
            file: selectedFile,
            title: title || selectedFile.name,
            category: matchedCategory,
            monthOrQuarter,
            branchOrOffice,
            uploadedBy: officerName,
            accessToken: googleAccessToken,
          });
          driveSyncStatus = 'synced';
          setUploadProgress(90);
        } catch (driveErr) {
          console.warn('Google Drive direct upload failed, saving locally:', driveErr);
          driveSyncStatus = 'pending';
        }
      } else {
        setUploadProgress(80);
        driveSyncStatus = 'pending';
      }

      const newReport: UploadedReport = {
        id: reportId,
        title: title || selectedFile.name,
        category,
        categoryHindi: matchedCategory,
        monthOrQuarter,
        branchOrOffice,
        uploadedBy: officerName,
        uploadedByEmail: currentUser?.email || 'user@rajbhasha.in',
        uploaderRole: currentUser?.role || 'user',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type || 'application/octet-stream',
        uploadDate: new Date().toISOString().split('T')[0],
        driveSyncStatus,
        googleDriveFileId: driveResult?.fileId,
        notes,
      };

      setUploadProgress(100);
      setSuccessMessage('प्रतिवेदन सफलतापूर्वक सुरक्षित सर्वर पर संधारित कर दिया गया है!');

      setTimeout(() => {
        onUploadSuccess(newReport);
        onClose();
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(`अपलोड में त्रुटि: ${msg}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-amber-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Upload className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">राजभाषा प्रतिवेदन अपलोड करें</h2>
              <p className="text-xs text-amber-100">
                केंद्रीय सुरक्षित रिपॉजिटरी में प्रतिवेदन संधारण
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Drive Status Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>
              भंडारण स्थिति: <strong className="font-semibold text-emerald-950">केंद्रीय सुरक्षित रिपॉजिटरी</strong>
            </span>
          </div>
          {googleAccessToken ? (
            <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
              <Check className="w-3.5 h-3.5" /> गूगल ड्राइव सक्रिय
            </span>
          ) : (
            <button
              type="button"
              onClick={onConnectGoogle}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-0.5 rounded transition-colors"
            >
              गूगल से कनेक्ट करें
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Permission Notice */}
          {isAdmin ? (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-center gap-2">
              <span className="font-bold px-1.5 py-0.5 rounded bg-red-700 text-white text-[10px]">प्रशासक</span>
              <span>आप सभी श्रेणियों (मासिक, QPR, आर.वी. प्रारूप, ई-पत्रिका, परिपत्र आदि) में अपलोड कर सकते हैं।</span>
            </div>
          ) : (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-center gap-2">
              <span className="font-bold px-1.5 py-0.5 rounded bg-blue-700 text-white text-[10px]">उपयोक्ता</span>
              <span>उपयोक्ता केवल <strong>मासिक प्रतिवेदन (R.V. 1)</strong> एवं <strong>तिमाही प्रगति रिपोर्ट (QPR)</strong> अपलोड कर सकते हैं।</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                प्रतिवेदन श्रेणी (Report Category): *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.hindi}
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                प्रतिवेदन का शीर्षक / विषय (Report Title / Subject): *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. मासिक प्रगति प्रतिवेदन आर.वी.-1 (अगस्त 2026)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* Two-column layout for details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>अवधि / माह / तिमाही (Period):</span>
                </label>
                <input
                  type="text"
                  value={monthOrQuarter}
                  onChange={(e) => setMonthOrQuarter(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  placeholder="उदा. सितंबर 2026 या Q2 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>कार्यालय / शाखा का नाम (Office/Branch):</span>
                </label>
                <input
                  type="text"
                  value={branchOrOffice}
                  onChange={(e) => setBranchOrOffice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  placeholder="उदा. आंचलिक कार्यालय पटना / शाखा कंकड़बाग"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>प्रतिवेदक / अधिकारी का नाम व पदनाम (Officer Name):</span>
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                placeholder="उदा. राजभाषा अधिकारी / प्रबंधक"
              />
            </div>

            {/* File Upload Zone (Supports both Drag-and-Drop and Manual Click Selection) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                फ़ाइल संलग्न करें (Attach Document - PDF, Word, Excel, Images): *
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-500 bg-red-50/70 scale-[0.99]'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-red-400 bg-slate-50 hover:bg-red-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.png"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-xs">
                        {selectedFile.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB • फ़ाइल बदलने के लिए क्लिक करें
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      फ़ाइल यहां ड्रैग एवं ड्रॉप करें, अथवा ब्राउज़ करने के लिए क्लिक करें
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      (Drag and drop file here, or click to browse. Max: 25MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                विशेष टिप्पणी / सारांश (Optional Notes / Summary):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="प्रतिवेदन से संबंधित महत्वपूर्ण बिंदु अथवा पत्राचार संदर्भ..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg resize-none focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>गूगल ड्राइव पर अपलोड हो रहा है...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="submit"
                id="submit-report-upload-btn"
                disabled={isUploading}
                className="px-5 py-2 text-xs font-bold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Cloud className="w-4 h-4" />
                <span>
                  {isUploading ? 'सहेज रहे हैं...' : 'सुरक्षित अपलोड व संधारण'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
