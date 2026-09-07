import React, { useState } from 'react';
import {
  Upload,
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  Check,
  AlertCircle,
  File,
} from 'lucide-react';
import { AuthUser } from '../types';

export interface TabUploadedDoc {
  id: string;
  tabKey: string;
  title: string;
  category?: string;
  format: 'word' | 'csv' | 'excel' | 'pdf' | 'other';
  fileName: string;
  fileDataUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface TabUploadSegmentProps {
  tabKey: string;
  tabTitle: string;
  placeholderTitle?: string;
  helpText?: string;
  defaultFormat?: 'word' | 'csv' | 'excel' | 'pdf' | 'other';
  isAdmin: boolean;
  currentUser: AuthUser | null;
  tabUploadedDocs: TabUploadedDoc[];
  onAddDoc: (doc: TabUploadedDoc) => void;
  onDeleteDoc: (id: string) => void;
}

export const TabUploadSegment: React.FC<TabUploadSegmentProps> = ({
  tabKey,
  tabTitle,
  placeholderTitle = 'दस्तावेज़ / प्रपत्र शीर्षक दर्ज करें...',
  helpText,
  defaultFormat = 'word',
  isAdmin,
  currentUser,
  tabUploadedDocs,
  onAddDoc,
  onDeleteDoc,
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docFormat, setDocFormat] = useState<'word' | 'csv' | 'excel' | 'pdf' | 'other'>(defaultFormat);
  const [docCategory, setDocCategory] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; dataUrl: string; size: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const docs = tabUploadedDocs.filter((d) => d.tabKey === tabKey);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.csv')) {
      setDocFormat('csv');
    } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      setDocFormat('word');
    } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) {
      setDocFormat('excel');
    } else if (lowerName.endsWith('.pdf')) {
      setDocFormat('pdf');
    }

    if (!docTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setDocTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        dataUrl: reader.result as string,
        size: file.size,
      });
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      setErrorMessage('कृपया प्रपत्र / दस्तावेज़ का शीर्षक दर्ज करें।');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('कृपया अपलोड करने हेतु Word, CSV, Excel अथवा PDF फ़ाइल चुनें।');
      return;
    }

    const newDoc: TabUploadedDoc = {
      id: `doc-${tabKey}-${Date.now()}`,
      tabKey,
      title: docTitle.trim(),
      category: docCategory.trim() || undefined,
      format: docFormat,
      fileName: selectedFile.name,
      fileDataUrl: selectedFile.dataUrl,
      fileSize: selectedFile.size,
      uploadedBy: currentUser?.displayName || 'मुख्य व्यवस्थापक',
      uploadedAt: new Date().toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      notes: docNotes.trim() || undefined,
    };

    onAddDoc(newDoc);
    setDocTitle('');
    setDocNotes('');
    setDocCategory('');
    setSelectedFile(null);
    setShowUploadForm(false);
    setErrorMessage(null);
    setSuccessMessage(`'${newDoc.title}' सफलतापूर्वक अपलोड व प्रकाशित हो गया है!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDownloadDoc = (doc: TabUploadedDoc) => {
    if (!doc.fileDataUrl) return;
    const a = document.createElement('a');
    a.href = doc.fileDataUrl;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFormatBadge = (fmt: TabUploadedDoc['format']) => {
    switch (fmt) {
      case 'word':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px] flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Word (.docx)</span>
          </span>
        );
      case 'csv':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3" />
            <span>CSV (.csv)</span>
          </span>
        );
      case 'excel':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold text-[10px] flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3" />
            <span>Excel (.xlsx)</span>
          </span>
        );
      case 'pdf':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>PDF (.pdf)</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px] flex items-center gap-1">
            <File className="w-3 h-3" />
            <span>फ़ाइल</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Toast Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between gap-2 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* ADMIN UPLOAD SEGMENT HEADER */}
      {isAdmin && (
        <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-red-700 shrink-0" />
              <span className="font-bold text-xs text-red-950">
                प्रशासक अपलोड अनुभाग • {tabTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showUploadForm ? 'फ़ॉर्म छिपाएं' : '+ नया प्रारूप / सामग्री अपलोड करें'}</span>
            </button>
          </div>

          {helpText && !showUploadForm && (
            <p className="text-[11px] text-red-900/80">{helpText}</p>
          )}

          {/* ADMIN UPLOAD FORM */}
          {showUploadForm && (
            <form
              onSubmit={handleUploadSubmit}
              className="bg-white p-3.5 rounded-lg border border-red-100 space-y-3 text-xs"
            >
              {errorMessage && (
                <div className="p-2 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    प्रारूप / दस्तावेज़ शीर्षक *
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder={placeholderTitle}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    फ़ाइल प्रारूप (Format)
                  </label>
                  <select
                    value={docFormat}
                    onChange={(e) => setDocFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none bg-white font-semibold"
                  >
                    <option value="word">Word प्रपत्र (.doc / .docx)</option>
                    <option value="csv">CSV प्रपत्र (.csv)</option>
                    <option value="excel">Excel प्रपत्र (.xls / .xlsx)</option>
                    <option value="pdf">PDF प्रपत्र (.pdf)</option>
                    <option value="other">अन्य दस्तावेज़ (.txt आदि)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  फ़ाइल संलग्न करें * (Word, CSV, Excel, PDF)
                </label>
                <input
                  type="file"
                  accept=".doc,.docx,.csv,.xlsx,.xls,.pdf,.txt"
                  onChange={handleFileChange}
                  className="w-full px-3 py-1.5 border rounded-lg bg-slate-50 text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-700 file:text-white hover:file:bg-red-800 cursor-pointer"
                  required
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    ✓ चयनित फ़ाइल: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  संक्षिप्त टिप्पणी / दिशानिर्देश (वैकल्पिक)
                </label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="उदा. क्षेत्रीय कार्यालयों एवं शाखाओं द्वारा उपयोग हेतु अनिवार्य प्रारूप..."
                  className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>प्रारूप अपलोड व प्रकाशित करें</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* UPLOADED DOCUMENTS & TEMPLATES LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-700" />
            <span>उपलब्ध आधिकारिक सामग्री / प्रारूप:</span>
          </h5>
          <span className="text-[11px] font-semibold text-slate-500">
            कुल फ़ाइलें: {docs.length}
          </span>
        </div>

        {docs.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1.5">
            <FileText className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
            <p className="font-bold text-slate-700 text-xs">
              आंचलिक कार्यालय द्वारा इस अनुभाग में अभी कोई फ़ाइल / प्रारूप अपलोड नहीं किया गया है।
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              {isAdmin
                ? 'मुख्य व्यवस्थापक ऊपर दिए गए "+ नया प्रारूप / सामग्री अपलोड करें" बटन से Word, CSV अथवा PDF फ़ाइल अपलोड कर सकते हैं।'
                : 'जैसे ही मुख्य प्रशासक द्वारा आधिकारिक प्रपत्र अपलोड किया जाएगा, वह यहाँ डाउनलोड हेतु उपलब्ध होगा।'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-red-300 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">{doc.title}</span>
                    {getFormatBadge(doc.format)}
                  </div>
                  {doc.notes && (
                    <p className="text-[11px] text-slate-600">{doc.notes}</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    फ़ाइल: {doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB • अपलोड दिनांक: {doc.uploadedAt} • प्रेषक: {doc.uploadedBy}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {/* REAL DOWNLOAD BUTTON ONLY FOR UPLOADED FILE */}
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(doc)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                    title="फ़ाइल डाउनलोड करें"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>डाउनलोड</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`क्या आप '${doc.title}' हटाना चाहते हैं?`)) {
                          onDeleteDoc(doc.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
