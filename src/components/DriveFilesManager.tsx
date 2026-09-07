import React, { useState } from 'react';
import { UploadedReport, AuthUser } from '../types';
import { 
  FolderLock, 
  X, 
  ExternalLink, 
  Search, 
  Download, 
  Cloud, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus,
  RefreshCw,
  Building,
  Calendar,
  User as UserIcon
} from 'lucide-react';

interface DriveFilesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: UploadedReport[];
  currentUser: AuthUser | null;
  onOpenUpload: () => void;
  isDriveConnected: boolean;
  onConnectGoogle: () => void;
}

export const DriveFilesManager: React.FC<DriveFilesManagerProps> = ({
  isOpen,
  onClose,
  reports,
  currentUser,
  onOpenUpload,
  isDriveConnected,
  onConnectGoogle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleDownloadFile = (report: UploadedReport) => {
    if (report.fileDataUrl) {
      const a = document.createElement('a');
      a.href = report.fileDataUrl;
      a.download = report.fileName || `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `राजभाषा विभाग • सेन्ट्रल बैंक ऑफ़ इण्डिया • आंचलिक कार्यालय पटना\n\nप्रतिवेदन: ${report.title}\nश्रेणी: ${report.categoryHindi}\nअवधि: ${report.monthOrQuarter}\nकार्यालय: ${report.branchOrOffice}\nप्रेषक: ${report.uploadedBy} (${report.uploadedByEmail})\nदिनांक: ${report.uploadDate}\n\nटिप्पणी: ${report.notes || 'प्रतिवेदन अभिलेख में दर्ज है।'}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName || `${report.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.branchOrOffice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || rep.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <FolderLock className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                केंद्रीय क्लाउड रिपोर्ट रिपॉजिटरी (Cloud Reports Repository)
              </h2>
              <p className="text-xs text-blue-200">
                आंचलिक कार्यालय पटना • अधिकृत प्रशासनिक संधारण
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

        {/* Sync & Target Notice Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-blue-950">
            <Cloud className={`w-4 h-4 ${isDriveConnected ? 'text-emerald-600' : 'text-blue-600'}`} />
            <span>
              फ़ोल्डर: <strong>राजभाषा_प्रतिवेदन_पटना_Zonal_Office</strong> • केंद्रीय क्लाउड स्टोरेज
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isDriveConnected && (
              <button
                onClick={onConnectGoogle}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-xs transition-colors shadow-2xs"
              >
                गूगल ड्राइव कनेक्ट करें
              </button>
            )}
            <button
              onClick={onOpenUpload}
              className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया प्रतिवेदन अपलोड करें</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="शीर्षक, फ़ाइल नाम, शाखा या प्रेषक द्वारा खोजें..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">सभी श्रेणियां (All Categories)</option>
            <option value="monthly_report">मासिक प्रतिवेदन (R.V. 1)</option>
            <option value="quarterly_report">तिमाही प्रगति रिपोर्ट (QPR)</option>
            <option value="rv_format">आर. वी. प्रारूप</option>
            <option value="annual_programme">वार्षिक कार्यक्रम</option>
            <option value="circular">परिपत्र</option>
            <option value="hindi_workshop">हिंदी कार्यशाला</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">कोई प्रतिवेदन नहीं मिला।</p>
              <p className="text-xs text-slate-400 mt-1">
                नया प्रतिवेदन अपलोड करने के लिए "नया प्रतिवेदन अपलोड करें" बटन दबाएं।
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-red-50 text-red-700 shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {report.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                          {report.categoryHindi}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {report.monthOrQuarter}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {report.branchOrOffice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-center">
                    {report.driveSyncStatus === 'synced' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ड्राइव में सहेजा गया</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>ड्राइव सिंक हेतु तैयार</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span>प्रेषक: <strong>{report.uploadedBy}</strong> ({report.uploadedByEmail})</span>
                    </span>
                    <span>फ़ाइल: <code className="font-mono text-slate-700">{report.fileName}</code></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(report)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                      title="फ़ाइल डाउनलोड करें"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>डाउनलोड करें</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
