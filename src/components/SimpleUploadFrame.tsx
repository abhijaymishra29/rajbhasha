import React, { useState, useRef } from 'react';
import { AuthUser, UploadedReport } from '../types';
import { uploadFileToGoogleDrive } from '../services/driveService';
import { getStoredRegions } from '../services/regionService';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FolderArchive, 
  ExternalLink, 
  Search, 
  Trash2, 
  HardDrive, 
  Filter, 
  Calendar,
  Building2,
  FileCheck,
  Sparkles
} from 'lucide-react';

interface SimpleUploadFrameProps {
  currentUser: AuthUser | null;
  googleAccessToken: string | null;
  reports: UploadedReport[];
  onUploadSuccess: (report: UploadedReport) => void;
  onDeleteReport?: (reportId: string) => void;
  onOpenFullUploadModal?: () => void;
}

export const SimpleUploadFrame: React.FC<SimpleUploadFrameProps> = ({
  currentUser,
  googleAccessToken,
  reports,
  onUploadSuccess,
  onDeleteReport,
}) => {
  const regions = getStoredRegions();

  // Current user's default region
  const defaultRegionId = currentUser?.region || (regions[0]?.id || 'patna');
  const defaultRegionObj = regions.find((r) => r.id === defaultRegionId) || regions[0];

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<'monthly_report' | 'quarterly_report' | 'other'>('monthly_report');
  const [regionId, setRegionId] = useState<string>(defaultRegionId);
  const [monthPeriod, setMonthPeriod] = useState('अगस्त 2026');
  const [customTitle, setCustomTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Search & Filter in document list
  const [searchTerm, setSearchTerm] = useState('');
  const [filterView, setFilterView] = useState<'my_region' | 'all'>('my_region');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
      if (!customTitle) {
        const catName = category === 'monthly_report' ? 'मासिक प्रगति प्रतिवेदन R.V. 1' : category === 'quarterly_report' ? 'तिमाही प्रगति प्रतिवेदन QPR' : 'राजभाषा प्रतिवेदन';
        setCustomTitle(`${catName} - ${file.name.replace(/\.[^/.]+$/, '')}`);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError('कृपया अपलोड करने हेतु पहले कोई फ़ाइल (PDF/Word/Excel) चुनें।');
      return;
    }

    setIsUploading(true);

    try {
      const regObj = regions.find((r) => r.id === regionId);
      const catHindi = category === 'monthly_report' 
        ? 'मासिक प्रतिवेदन (R.V. 1)' 
        : category === 'quarterly_report' 
        ? 'तिमाही रिपोर्ट (QPR)' 
        : 'अन्य राजभाषा प्रतिवेदन';

      const reportTitle = customTitle.trim() || `${catHindi} - ${regObj?.nameHindi || regionId} (${monthPeriod})`;

      // Read file data URL for instant in-browser downloads
      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(selectedFile);
      });

      let driveResult = null;
      let driveSyncStatus: 'synced' | 'pending' | 'local_only' = 'local_only';

      if (googleAccessToken) {
        try {
          driveResult = await uploadFileToGoogleDrive({
            file: selectedFile,
            title: reportTitle,
            category: catHindi,
            monthOrQuarter: monthPeriod,
            branchOrOffice: regObj?.nameHindi || 'आंचलिक कार्यालय पटना',
            uploadedBy: currentUser?.name || 'उपयोक्ता',
            accessToken: googleAccessToken,
          });
          driveSyncStatus = 'synced';
        } catch (driveErr) {
          console.warn('Google Drive sync warning:', driveErr);
          driveSyncStatus = 'pending';
        }
      }

      const newReport: UploadedReport = {
        id: 'rep-' + Date.now(),
        title: reportTitle,
        category,
        categoryHindi: catHindi,
        monthOrQuarter: monthPeriod,
        branchOrOffice: regObj?.nameHindi || (currentUser?.regionHindi || 'क्षेत्रीय कार्यालय'),
        uploadedBy: currentUser?.name || 'राजभाषा अधिकारी',
        uploadedByEmail: currentUser?.email || 'user@rajbhasha.in',
        uploaderRole: currentUser?.role || 'user',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type || 'application/pdf',
        fileDataUrl,
        uploadDate: new Date().toLocaleDateString('hi-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        googleDriveFileId: driveResult?.fileId,
        driveSyncStatus,
        notes: 'केंद्रीय सुरक्षित रिपॉजिटरी में संधारित',
      };

      onUploadSuccess(newReport);
      setUploadSuccess(`'${selectedFile.name}' सफलतापूर्वक अपलोड किया गया! आप इसे नीचे दी गई सूची से कभी भी डाउनलोड कर सकते हैं।`);

      // Reset form
      setSelectedFile(null);
      setCustomTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err?.message || 'फ़ाइल अपलोड करने में त्रुटि हुई।');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file download
  const handleDownloadReport = (rep: UploadedReport) => {
    if (rep.fileDataUrl) {
      const a = document.createElement('a');
      a.href = rep.fileDataUrl;
      a.download = rep.fileName || `${rep.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a clean official text/metadata report download if no binary cached
      const reportSummary = `सेन्ट्रल बैंक ऑफ़ इण्डिया • राजभाषा विभाग (आंचलिक कार्यालय पटना)
----------------------------------------------------------------------
आधिकारिक प्रतिवेदन विवरण (Official Rajbhasha Report)
----------------------------------------------------------------------
शीर्षक: ${rep.title}
श्रेणी: ${rep.categoryHindi}
अवधि / माह: ${rep.monthOrQuarter}
क्षेत्र / कार्यालय: ${rep.branchOrOffice}
प्रस्तुतकर्ता: ${rep.uploadedBy} (${rep.uploadedByEmail})
अपलोड दिनांक: ${rep.uploadDate}
संबद्ध प्रशासक गूगल ड्राइव: ${rep.adminTargetEmail}
फ़ाइल नाम: ${rep.fileName} (${(rep.fileSize / 1024).toFixed(1)} KB)
स्थिति: सुरक्षित रूप से संग्रहीत (Archived in Google Drive)
----------------------------------------------------------------------
`;
      const blob = new Blob(['\uFEFF' + reportSummary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rep.title.replace(/[/\\?%*:|"<>]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  // Check if current user has uploaded any report
  const userUploadedReports = reports.filter((r) => {
    if (!currentUser) return false;
    const emailMatch = currentUser.email && r.uploadedByEmail && r.uploadedByEmail.toLowerCase() === currentUser.email.toLowerCase();
    const nameMatch = currentUser.name && r.uploadedBy && r.uploadedBy.toLowerCase() === currentUser.name.toLowerCase();
    return emailMatch || nameMatch;
  });

  const hasUserUploadedAnything = userUploadedReports.length > 0;

  // Filtered documents - strictly restricted for normal users
  const filteredReports = reports.filter((r) => {
    // Non-admin user can ONLY see reports if they have uploaded, and can ONLY see their own uploaded reports
    if (!isAdmin) {
      if (!hasUserUploadedAnything) {
        return false;
      }
      const isMine = (currentUser?.email && r.uploadedByEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
                     (currentUser?.name && r.uploadedBy?.toLowerCase() === currentUser.name.toLowerCase());
      if (!isMine) {
        return false;
      }
    }

    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.branchOrOffice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.monthOrQuarter.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (isAdmin && filterView === 'my_region' && currentUser?.region) {
      const userRegObj = regions.find((reg) => reg.id === currentUser.region);
      const userRegName = userRegObj?.nameEnglish?.toLowerCase() || currentUser.region.toLowerCase();
      const userRegHindi = userRegObj?.nameHindi || currentUser.regionHindi || '';

      const officeLower = r.branchOrOffice.toLowerCase();
      return officeLower.includes(userRegName) || (userRegHindi && officeLower.includes(userRegHindi.split(' ')[0]));
    }

    return true;
  });

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden mb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-900 to-amber-950 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-4 border-amber-500">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
            <Upload className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                त्वरित प्रतिवेदन अपलोड एवं डाउनलोड मंच
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-red-950">
                सीधा ड्राइव कनेक्शन
              </span>
            </div>
            <p className="text-xs text-white/80">
              क्षेत्रीय अधिकारी प्रतिवेदन अपलोड करें एवं पूर्व अपलोड किए गए दस्तावेज़ों को तुरंत डाउनलोड करें
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
          <HardDrive className="w-3.5 h-3.5 text-amber-300" />
          <span>केंद्रीय रिपॉजिटरी: <strong className="text-amber-200">सुरक्षित संधारण</strong></span>
        </div>
      </div>

      {/* Grid: Upload Form on Left, Document List & Download on Right */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT: SIMPLE UPLOAD FRAME (5 Cols) ================= */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-700" />
                <span>प्रतिवेदन अपलोड करें (Upload Report)</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {currentUser?.regionHindi || 'क्षेत्रीय उपयोक्ता'}
              </span>
            </div>

            {/* Upload Notification Banners */}
            {uploadError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              
              {/* File Dropzone Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  फ़ाइल चुनें (Select File - PDF, Word, Excel, JPG): *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    selectedFile 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-300 hover:border-red-500 bg-white hover:bg-red-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold text-xs">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <div className="text-left">
                        <div className="font-bold truncate max-w-[220px]">{selectedFile.name}</div>
                        <div className="text-[10px] text-emerald-600 font-normal">
                          {(selectedFile.size / 1024).toFixed(1)} KB • तैयार है (Ready)
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-700 block">
                        कंप्यूटर से फ़ाइल चुनें (Click to Browse)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PDF, Word (.docx), Excel (.xlsx) अधिकतम 25 MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    प्रतिवेदन प्रकार:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-red-600"
                  >
                    <option value="monthly_report">मासिक प्रतिवेदन (R.V. 1)</option>
                    <option value="quarterly_report">तिमाही रिपोर्ट (QPR)</option>
                    <option value="other">अन्य प्रतिवेदन</option>
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    क्षेत्र (Region):
                  </label>
                  <select
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    disabled={currentUser?.role !== 'admin' && !!currentUser?.region}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-red-600 disabled:bg-slate-100"
                  >
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.nameHindi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month / Period */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    माह / अवधि:
                  </label>
                  <input
                    type="text"
                    value={monthPeriod}
                    onChange={(e) => setMonthPeriod(e.target.value)}
                    placeholder="उदा. अगस्त 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    शीर्षक विवरण (वैकल्पिक):
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="प्रतिवेदन का शीर्षक"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>अपलोड हो रहा है (Uploading to Drive)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>प्रतिवेदन अपलोड करें (Upload Report)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>अपलोड होते ही प्रतिवेदन सुरक्षित रूप से केंद्रीय रिपॉजिटरी में संधारित हो जाता है।</span>
          </div>
        </div>

        {/* ================= RIGHT: UPLOADED DOCUMENTS & INSTANT DOWNLOAD (7 Cols) ================= */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  अपलोड किए गए दस्तावेज़ (Uploaded Documents & Download)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                  {filteredReports.length} फ़ाइलें
                </span>
              </div>

              {/* Filter: My Region vs All (Admin only) or User Status */}
              {isAdmin ? (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setFilterView('my_region')}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                      filterView === 'my_region'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    मेरे क्षेत्र के ({currentUser?.regionHindi ? currentUser.regionHindi.split(' ')[0] : 'क्षेत्र'})
                  </button>
                  <button
                    onClick={() => setFilterView('all')}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                      filterView === 'all'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    सभी क्षेत्र (All)
                  </button>
                </div>
              ) : (
                <div className="text-[11px] font-bold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
                  {hasUserUploadedAnything ? 'आपके द्वारा प्रेषित प्रतिवेदन' : 'निजी प्रतिवेदन संधारण'}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="प्रतिवेदन खोजें (शीर्षक, क्षेत्र अथवा माह द्वारा)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* List of Documents */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {!isAdmin && !hasUserUploadedAnything ? (
                <div className="text-center py-8 px-4 bg-amber-50/70 rounded-xl border border-dashed border-amber-300">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-amber-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-amber-950 font-bold">
                    आपने अभी तक कोई प्रतिवेदन अपलोड नहीं किया है
                  </p>
                  <p className="text-[11px] text-amber-800/80 mt-1 max-w-sm mx-auto leading-relaxed">
                    सुरक्षा निर्देशानुसार, जब तक आप स्वयं अपना प्रतिवेदन अपलोड नहीं करते, तब तक यहाँ कोई डेटा प्रदर्शित नहीं होगा। कृपया बाईं ओर दिए गए फ़ॉर्म से अपना पहला प्रतिवेदन तुरंत अपलोड करें।
                  </p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">कोई प्रतिवेदन उपलब्ध नहीं है</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    बाईं ओर दिए गए फॉर्म से अपना पहला प्रतिवेदन तुरंत अपलोड करें
                  </p>
                </div>
              ) : (
                filteredReports.map((rep) => {
                  const isQpr = rep.category === 'quarterly_report';

                  return (
                    <div
                      key={rep.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isQpr ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[280px] sm:max-w-[340px]" title={rep.title}>
                            {rep.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                            <span className={`px-1.5 py-0.5 rounded-sm font-semibold ${
                              isQpr ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}>
                              {rep.categoryHindi}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 font-semibold text-slate-700">
                              {rep.branchOrOffice}
                            </span>
                            <span>•</span>
                            <span>{rep.monthOrQuarter}</span>
                            <span>•</span>
                            <span>दिनांक: {rep.uploadDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Download & Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleDownloadReport(rep)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                          title="दस्तावेज़ डाउनलोड करें (Download File)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>डाउनलोड</span>
                        </button>

                        {(currentUser?.role === 'admin' || currentUser?.name === rep.uploadedBy) && onDeleteReport && (
                          <button
                            onClick={() => onDeleteReport(rep.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              कुल दस्तावेज़: <strong>{reports.length}</strong> (मासिक R.V. 1 एवं तिमाही QPR)
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>डाउनलोड हेतु पूर्णतः सक्रिय</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
