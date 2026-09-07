import React, { useState, useEffect } from 'react';
import { ActiveModalType, UploadedReport, AuthUser, GlossaryItem } from '../types';
import { 
  ADMINISTRATIVE_GLOSSARY, 
  BANKING_GLOSSARY, 
  AUTHOR_OF_MONTH, 
  THOUGHT_OF_THE_DAY 
} from '../data/defaultData';
import { MagazineReader } from './MagazineReader';
import { uploadFileToGoogleDrive } from '../services/driveService';
import { getStoredRegions } from '../services/regionService';
import { TabUploadSegment, TabUploadedDoc } from './TabUploadSegment';
import { 
  X, 
  FileText, 
  Upload, 
  Search, 
  BookOpen, 
  Calendar, 
  Building, 
  Users, 
  Award, 
  Volume2, 
  CheckCircle2, 
  Download, 
  Share2, 
  ExternalLink,
  Languages,
  Sparkles,
  Info,
  Plus,
  Edit3,
  Trash2,
  Paperclip,
  Save,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Building2,
  Send,
  Loader2,
  HardDrive
} from 'lucide-react';

interface DetailModalProps {
  modalType: ActiveModalType;
  onClose: () => void;
  onOpenUpload: () => void;
  reports: UploadedReport[];
  currentUser?: AuthUser | null;
  googleAccessToken?: string | null;
  onUploadSuccess?: (report: UploadedReport) => void;
  onDeleteReport?: (reportId: string) => void;
}

export interface CustomBankingDoc {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileDataUrl?: string;
  date: string;
}

export interface CustomCircular {
  id: string;
  circularNo: string;
  date: string;
  title: string;
  summary: string;
  fileName?: string;
  fileDataUrl?: string;
}

export interface CustomAuthorData {
  hindiName: string;
  englishName: string;
  birthPlace: string;
  era: string;
  popularQuote: string;
  bio: string;
  famousWorks: string[];
  image: string;
  docTitle?: string;
  docFileName?: string;
  docDataUrl?: string;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  modalType,
  onClose,
  onOpenUpload,
  reports,
  currentUser,
  googleAccessToken,
  onUploadSuccess,
  onDeleteReport,
}) => {
  const [glossarySearch, setGlossarySearch] = useState('');
  const [bankingSearch, setBankingSearch] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const regions = getStoredRegions();

  // ================= MONTHLY REPORT PERSONAL TAB (UPLOAD & DOWNLOAD) =================
  const [monthlyFile, setMonthlyFile] = useState<File | null>(null);
  const [monthlyMonth, setMonthlyMonth] = useState('अगस्त 2026');
  const [monthlyRegion, setMonthlyRegion] = useState(() => currentUser?.region || 'patna');
  const [monthlyNotes, setMonthlyNotes] = useState('');
  const [monthlyUploading, setMonthlyUploading] = useState(false);
  const [monthlySuccess, setMonthlySuccess] = useState<string | null>(null);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const [showMonthlyUploadCard, setShowMonthlyUploadCard] = useState(false);

  // ================= QUARTERLY REPORT (QPR) PERSONAL TAB (UPLOAD & DOWNLOAD) =================
  const [qprFile, setQprFile] = useState<File | null>(null);
  const [qprQuarter, setQprQuarter] = useState('द्वितीय तिमाही (जुलाई - सितम्बर 2026)');
  const [qprRegion, setQprRegion] = useState(() => currentUser?.region || 'patna');
  const [qprNotes, setQprNotes] = useState('');
  const [qprUploading, setQprUploading] = useState(false);
  const [qprSuccess, setQprSuccess] = useState<string | null>(null);
  const [qprError, setQprError] = useState<string | null>(null);
  const [showQprUploadCard, setShowQprUploadCard] = useState(false);

  // ================= 1. BANKING GLOSSARY CUSTOM DATA (ADMIN UPLOAD) =================
  const [customBankingTerms, setCustomBankingTerms] = useState<GlossaryItem[]>(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_custom_banking_glossary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customBankingDocs, setCustomBankingDocs] = useState<CustomBankingDoc[]>(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_custom_banking_docs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin Banking Form States
  const [showAddBankingModal, setShowAddBankingModal] = useState(false);
  const [bankingAddTab, setBankingAddTab] = useState<'term' | 'doc'>('doc');
  const [newBankEnglish, setNewBankEnglish] = useState('');
  const [newBankHindi, setNewBankHindi] = useState('');
  const [newBankMeaning, setNewBankMeaning] = useState('');
  const [newBankSentence, setNewBankSentence] = useState('');
  const [newBankDocTitle, setNewBankDocTitle] = useState('');
  const [newBankDocDesc, setNewBankDocDesc] = useState('');
  const [newBankDocFile, setNewBankDocFile] = useState<{ name: string; dataUrl?: string } | null>(null);

  // ================= 2. AUTHOR OF THE MONTH CUSTOM DATA (ADMIN UPLOAD) =================
  const [authorData, setAuthorData] = useState<CustomAuthorData>(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_custom_author');
      return saved ? JSON.parse(saved) : {
        ...AUTHOR_OF_MONTH,
        docTitle: 'मुंशी प्रेमचंद - प्रमुख कहानियां एवं साहित्यिक संकलन',
        docFileName: 'Munshi_Premchand_Sahitya_Sankalan.pdf',
      };
    } catch {
      return {
        ...AUTHOR_OF_MONTH,
        docTitle: 'मुंशी प्रेमचंद - प्रमुख कहानियां एवं साहित्यिक संकलन',
        docFileName: 'Munshi_Premchand_Sahitya_Sankalan.pdf',
      };
    }
  });

  const [showEditAuthorModal, setShowEditAuthorModal] = useState(false);
  const [editAuthorForm, setEditAuthorForm] = useState<CustomAuthorData>(authorData);

  // ================= 3. CIRCULARS CUSTOM DATA (ADMIN UPLOAD) =================
  const [circularsList, setCircularsList] = useState<CustomCircular[]>(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_custom_circulars');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // ================= 4. ALL TABS UPLOADED TEMPLATES & DOCUMENTS (ADMIN CONTROLLED) =================
  const [tabUploadedDocs, setTabUploadedDocs] = useState<TabUploadedDoc[]>(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_tab_uploaded_docs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddTabDoc = (doc: TabUploadedDoc) => {
    const updated = [doc, ...tabUploadedDocs];
    setTabUploadedDocs(updated);
    localStorage.setItem('rajbhasha_tab_uploaded_docs', JSON.stringify(updated));
    showActionToast(`'${doc.title}' सफलतापूर्वक प्रकाशित कर दिया गया है।`);
  };

  const handleDeleteTabDoc = (id: string) => {
    const updated = tabUploadedDocs.filter((d) => d.id !== id);
    setTabUploadedDocs(updated);
    localStorage.setItem('rajbhasha_tab_uploaded_docs', JSON.stringify(updated));
    showActionToast('दस्तावेज़ हटा दिया गया है।');
  };

  const [showAddCircularModal, setShowAddCircularModal] = useState(false);
  const [newCircNo, setNewCircNo] = useState('');
  const [newCircDate, setNewCircDate] = useState(new Date().toLocaleDateString('hi-IN'));
  const [newCircTitle, setNewCircTitle] = useState('');
  const [newCircSummary, setNewCircSummary] = useState('');
  const [newCircFile, setNewCircFile] = useState<{ name: string; dataUrl?: string } | null>(null);

  // Toast feedback inside modal
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showActionToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDownloadFile = (rep: UploadedReport) => {
    if (rep.fileDataUrl) {
      const a = document.createElement('a');
      a.href = rep.fileDataUrl;
      a.download = rep.fileName || `${rep.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `राजभाषा विभाग • सेन्ट्रल बैंक ऑफ़ इण्डिया • आंचलिक कार्यालय पटना\n\nप्रतिवेदन: ${rep.title}\nश्रेणी: ${rep.categoryHindi}\nअवधि: ${rep.monthOrQuarter}\nकार्यालय: ${rep.branchOrOffice}\nप्रेषक: ${rep.uploadedBy} (${rep.uploadedByEmail})\nदिनांक: ${rep.uploadDate}\n\nविवरण / टिप्पणी:\n${rep.notes || 'प्रतिवेदन आधिकारिक रूप से सत्यापित है।'}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = rep.fileName || `${rep.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadGenericSample = (docName: string, customDataUrl?: string) => {
    if (customDataUrl) {
      const a = document.createElement('a');
      a.href = customDataUrl;
      a.download = `${docName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    showActionToast('प्रशासक द्वारा अभी तक इस दस्तावेज़ की फ़ाइल अपलोड नहीं की गई है।');
  };

  // ================= CSV EXPORT HANDLERS FOR GLOSSARY & CIRCULARS =================
  const handleDownloadBankingGlossaryCsv = () => {
    const rows = allBankingGlossary.map((item, idx) => [
      idx + 1,
      `"${item.english.replace(/"/g, '""')}"`,
      `"${item.hindi.replace(/"/g, '""')}"`,
      `"${item.meaning.replace(/"/g, '""')}"`,
      `"${item.exampleSentence.replace(/"/g, '""')}"`,
    ]);
    const csv = `\uFEFFक्र.सं.,अंग्रेजी बैंकिंग शब्द (English Term),मानक हिंदी अनुवाद (Hindi Term),परिभाषा एवं संदर्भ (Meaning),बैंकिंग वाक्य प्रयोग (Example Sentence)\n` +
      rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `सेन्ट्रल_बैंक_बैंकिंग_शब्दावली_RBI_CBI.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAdminGlossaryCsv = () => {
    const rows = ADMINISTRATIVE_GLOSSARY.map((item, idx) => [
      idx + 1,
      `"${item.english.replace(/"/g, '""')}"`,
      `"${item.hindi.replace(/"/g, '""')}"`,
      `"${item.meaning.replace(/"/g, '""')}"`,
      `"${item.exampleSentence.replace(/"/g, '""')}"`,
    ]);
    const csv = `\uFEFFक्र.सं.,अंग्रेजी प्रशासनिक पद / शब्द (English),मानक हिंदी अनुवाद (Hindi),प्रशासनिक संदर्भ (Context),वाक्य प्रयोग (Example Sentence)\n` +
      rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `सेन्ट्रल_बैंक_प्रशासनिक_शब्दावली_CBI.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCircularsCsv = () => {
    const rows = circularsList.map((circ, idx) => [
      idx + 1,
      `"${circ.circularNo.replace(/"/g, '""')}"`,
      `"${circ.date.replace(/"/g, '""')}"`,
      `"${circ.title.replace(/"/g, '""')}"`,
      `"${circ.summary.replace(/"/g, '""')}"`,
    ]);
    const csv = `\uFEFFक्र.सं.,परिपत्र क्रमांक (Circular No.),जारी दिनांक (Date),विषय / शीर्षक (Subject),मुख्य निर्देश / विवरण (Summary)\n` +
      rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `राजभाषा_परिपत्र_एवं_आदेश_सूची_CBI_Patna.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ================= INLINE UPLOAD HANDLERS FOR PERSONAL TABS =================
  const handleMonthlyUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMonthlyError(null);
    setMonthlySuccess(null);
    if (!monthlyFile) {
      setMonthlyError('कृपया पहले कोई फ़ाइल (PDF, Excel, Word) चुनें।');
      return;
    }
    setMonthlyUploading(true);
    try {
      const regObj = regions.find(r => r.id === monthlyRegion);
      const regName = regObj?.nameHindi || currentUser?.regionHindi || 'क्षेत्रीय कार्यालय पटना';
      const reportTitle = `मासिक प्रतिवेदन (R.V. 1) - ${regName} (${monthlyMonth})`;

      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(monthlyFile);
      });

      let driveResult = null;
      let driveSyncStatus: 'synced' | 'pending' | 'local_only' = 'local_only';

      if (googleAccessToken) {
        try {
          driveResult = await uploadFileToGoogleDrive({
            file: monthlyFile,
            title: reportTitle,
            category: 'मासिक प्रतिवेदन (R.V. 1)',
            monthOrQuarter: monthlyMonth,
            branchOrOffice: regName,
            uploadedBy: currentUser?.name || 'उपयोक्ता',
            accessToken: googleAccessToken,
          });
          driveSyncStatus = 'synced';
        } catch (err) {
          console.warn('Drive sync:', err);
          driveSyncStatus = 'pending';
        }
      }

      const newReport: UploadedReport = {
        id: 'rep-m-' + Date.now(),
        title: reportTitle,
        category: 'monthly_report',
        categoryHindi: 'मासिक प्रतिवेदन (R.V. 1)',
        monthOrQuarter: monthlyMonth,
        branchOrOffice: regName,
        uploadedBy: currentUser?.name || 'राजभाषा अधिकारी',
        uploadedByEmail: currentUser?.email || 'user@rajbhasha.in',
        uploaderRole: currentUser?.role || 'user',
        fileName: monthlyFile.name,
        fileSize: monthlyFile.size,
        fileType: monthlyFile.type || 'application/pdf',
        fileDataUrl,
        uploadDate: new Date().toLocaleDateString('hi-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        googleDriveFileId: driveResult?.fileId,
        driveSyncStatus,
        notes: monthlyNotes || 'संबद्ध केंद्रीय राजभाषा सर्वर पर सत्यापित प्रतिवेदन।',
      };

      if (onUploadSuccess) {
        onUploadSuccess(newReport);
      }
      setMonthlySuccess(`'${monthlyFile.name}' सफलतापूर्वक अपलोड किया गया! प्रतिवेदन नीचे दी गई डाउनलोड सूची में जुड़ गया है।`);
      setMonthlyFile(null);
      setMonthlyNotes('');
      setShowMonthlyUploadCard(false);
    } catch (err: any) {
      setMonthlyError(err?.message || 'फ़ाइल अपलोड करने में विफल।');
    } finally {
      setMonthlyUploading(false);
    }
  };

  const handleQprUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQprError(null);
    setQprSuccess(null);
    if (!qprFile) {
      setQprError('कृपया पहले कोई फ़ाइल (PDF, Excel, Word) चुनें।');
      return;
    }
    setQprUploading(true);
    try {
      const regObj = regions.find(r => r.id === qprRegion);
      const regName = regObj?.nameHindi || currentUser?.regionHindi || 'क्षेत्रीय कार्यालय पटना';
      const reportTitle = `तिमाही प्रगति रिपोर्ट (QPR) - ${regName} (${qprQuarter})`;

      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(qprFile);
      });

      let driveResult = null;
      let driveSyncStatus: 'synced' | 'pending' | 'local_only' = 'local_only';

      if (googleAccessToken) {
        try {
          driveResult = await uploadFileToGoogleDrive({
            file: qprFile,
            title: reportTitle,
            category: 'तिमाही रिपोर्ट (QPR)',
            monthOrQuarter: qprQuarter,
            branchOrOffice: regName,
            uploadedBy: currentUser?.name || 'उपयोक्ता',
            accessToken: googleAccessToken,
          });
          driveSyncStatus = 'synced';
        } catch (err) {
          console.warn('Drive sync:', err);
          driveSyncStatus = 'pending';
        }
      }

      const newReport: UploadedReport = {
        id: 'rep-q-' + Date.now(),
        title: reportTitle,
        category: 'quarterly_report',
        categoryHindi: 'तिमाही रिपोर्ट (QPR)',
        monthOrQuarter: qprQuarter,
        branchOrOffice: regName,
        uploadedBy: currentUser?.name || 'राजभाषा अधिकारी',
        uploadedByEmail: currentUser?.email || 'user@rajbhasha.in',
        uploaderRole: currentUser?.role || 'user',
        fileName: qprFile.name,
        fileSize: qprFile.size,
        fileType: qprFile.type || 'application/pdf',
        fileDataUrl,
        uploadDate: new Date().toLocaleDateString('hi-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        googleDriveFileId: driveResult?.fileId,
        driveSyncStatus,
        notes: qprNotes || 'संबद्ध केंद्रीय राजभाषा सर्वर पर सत्यापित प्रतिवेदन।',
      };

      if (onUploadSuccess) {
        onUploadSuccess(newReport);
      }
      setQprSuccess(`'${qprFile.name}' सफलतापूर्वक अपलोड किया गया! प्रतिवेदन नीचे दी गई डाउनलोड सूची में जुड़ गया है।`);
      setQprFile(null);
      setQprNotes('');
      setShowQprUploadCard(false);
    } catch (err: any) {
      setQprError(err?.message || 'फ़ाइल अपलोड करने में विफल।');
    } finally {
      setQprUploading(false);
    }
  };

  if (!modalType || modalType === 'upload_report' || modalType === 'admin_backgrounds' || modalType === 'drive_manager') {
    return null;
  }

  const handleSpeakThought = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(THOUGHT_OF_THE_DAY.hindi);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredAdminGlossary = ADMINISTRATIVE_GLOSSARY.filter(
    (item) =>
      item.english.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.hindi.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.meaning.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const allBankingGlossary = [...customBankingTerms, ...BANKING_GLOSSARY];

  const filteredBankingGlossary = allBankingGlossary.filter(
    (item) =>
      item.english.toLowerCase().includes(bankingSearch.toLowerCase()) ||
      item.hindi.toLowerCase().includes(bankingSearch.toLowerCase()) ||
      item.meaning.toLowerCase().includes(bankingSearch.toLowerCase())
  );

  // ================= REPORTING VISIBILITY LOGIC =================
  // If user is not admin, ONLY show reports uploaded by this user.
  // If this user has not uploaded anything, don't show any reports!
  const isReportMatchCurrentUser = (r: UploadedReport) => {
    if (isAdmin) return true;
    if (!currentUser) return false;

    const matchesEmail = currentUser.email && r.uploadedByEmail?.toLowerCase() === currentUser.email.toLowerCase();
    const matchesName = currentUser.name && r.uploadedBy?.toLowerCase() === currentUser.name.toLowerCase();
    const matchesRegion = currentUser.region && r.branchOrOffice?.toLowerCase().includes(currentUser.region.toLowerCase());
    const matchesRegionHindi = currentUser.regionHindi && r.branchOrOffice?.includes(currentUser.regionHindi);

    return Boolean(matchesEmail || matchesName || matchesRegion || matchesRegionHindi);
  };

  const visibleMonthlyReports = reports
    .filter((r) => r.category === 'monthly_report' || r.category === 'rv_format')
    .filter(isReportMatchCurrentUser);

  const visibleQuarterlyReports = reports
    .filter((r) => r.category === 'quarterly_report')
    .filter(isReportMatchCurrentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-amber-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-amber-200 uppercase tracking-wider block">
              राजभाषा विभाग • आंचलिक कार्यालय पटना
            </span>
            <h2 className="text-base sm:text-lg font-extrabold leading-tight mt-0.5">
              {modalType === 'home' && 'मुख्य पृष्ठ (Home Portal)'}
              {modalType === 'monthly_report' && 'मासिक प्रतिवेदन (आर.वी. 1 / Monthly Report)'}
              {modalType === 'quarterly_report' && 'तिमाही प्रगति रिपोर्ट (Quarterly Progress Report - QPR)'}
              {modalType === 'emagazine' && 'ई-पत्रिका "पाटलिपुत्र सौरभ" (E-Magazine)'}
              {modalType === 'olic' && 'राजभाषा कार्यान्वयन समिति (OLIC Committee)'}
              {modalType === 'rv_format' && 'आर. वी. प्रारूप (R.V. Format) - क्षेत्रीय कार्यालय'}
              {modalType === 'annual_programme' && 'वार्षिक कार्यक्रम (Annual Programme) - गृह मंत्रालय'}
              {modalType === 'mis_portal' && 'सूचना प्रबंधन प्रणाली (MIS Portal) - राजभाषा विभाग'}
              {modalType === 'hindi_workshop' && 'हिंदी कार्यशाला (Hindi Workshop)'}
              {modalType === 'tolic' && 'नगर राजभाषा कार्यान्वयन समिति (नराकास - TOLIC Patna)'}
              {modalType === 'circulars' && 'परिपत्र एवं आदेश (Circulars & Orders)'}
              {modalType === 'author_of_month' && 'इस माह के चयनित साहित्यकार (Author of the Month)'}
              {modalType === 'admin_glossary' && 'सरल प्रशासनिक शब्दावली (Administrative Glossary)'}
              {modalType === 'banking_glossary' && 'बैंकिंग शब्दावली (Banking Glossary - RBI)'}
              {modalType === 'thought_of_day' && 'आज का विचार (Thought of the Day)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          {/* 1. HOME MODAL */}
          {modalType === 'home' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h3 className="font-bold text-base text-red-900 mb-1">
                  राजभाषा विभाग आंचलिक कार्यालय पटना में आपका स्वागत है
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  यह एकीकृत पोर्टल सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना के अंतर्गत कार्यरत सभी क्षेत्रीय कार्यालयों एवं शाखाओं के लिए संघ की राजभाषा नीति, मासिक प्रतिवेदन आर.वी. 1, तिमाही प्रगति रिपोर्ट, परिपत्र तथा प्रशासनिक शब्दावली संधारित करने हेतु विकसित किया गया है।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 mb-1">मुख्य लक्ष्य एवं उद्देश्य:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>धारा 3(3) का 100% अनुपालन सुनिश्चित करना।</li>
                    <li>'क' एवं 'ख' क्षेत्र को भेजे जाने वाले शत-प्रतिशत पत्र हिंदी में प्रेषित करना।</li>
                    <li>सभी शाखाओं में मानक द्विभाषी कंप्यूटर कीबोर्ड एवं यूनिकोड का प्रयोग।</li>
                    <li>प्रतिवेदन सुरक्षित केंद्रीय क्लाउड सर्वर पर समयबद्ध अपलोड।</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 mb-1">संपर्क एवं सहायता:</h4>
                  <p className="text-slate-600">
                    <strong>कार्यालय:</strong> सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय, मौर्या लोक कॉम्प्लेक्स, पटना - 800001
                  </p>
                  <p className="text-slate-600 mt-1">
                    <strong>ईमेल:</strong> rajbhasha.patna@centralbank.co.in
                  </p>
                  <p className="text-slate-600 mt-1">
                    <strong>हेल्पलाइन:</strong> 0612-2223456 / राजभाषा कक्ष
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 bg-[#b91c1c] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>प्रतिवेदन अपलोड करें (Upload to Admin Drive)</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. MONTHLY REPORT (R.V. 1) - CLUBBED UPLOAD & DOWNLOAD HUB */}
          {modalType === 'monthly_report' && (
            <div className="space-y-4 text-xs">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-red-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-red-950 text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-red-700" />
                    <span>मासिक प्रतिवेदन (R.V. 1): व्यक्तिगत अपलोड एवं डाउनलोड केंद्र</span>
                  </h4>
                  <p className="text-slate-600 mt-0.5">
                    क्षेत्रीय कार्यालय (पटना, दरभंगा, मुजफ्फरपुर, गया आदि) हेतु आर.वी. 1 प्रपत्र डाउनलोड करें एवं अपना मासिक प्रतिवेदन अपलोड करें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMonthlyUploadCard(!showMonthlyUploadCard)}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0 self-start sm:self-auto"
                >
                  {showMonthlyUploadCard ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  <span>{showMonthlyUploadCard ? 'अपलोड फ़ॉर्म बंद करें' : '+ नया मासिक प्रतिवेदन अपलोड करें'}</span>
                </button>
              </div>

              {/* Success / Error Banners */}
              {monthlySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{monthlySuccess}</span>
                  </div>
                  <button onClick={() => setMonthlySuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {monthlyError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-semibold">{monthlyError}</span>
                  </div>
                  <button onClick={() => setMonthlyError(null)} className="text-red-700 hover:text-red-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* SEGMENT 1: INLINE UPLOAD FORM */}
              {showMonthlyUploadCard && (
                <form onSubmit={handleMonthlyUploadSubmit} className="p-4 bg-white border-2 border-red-300 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-red-700" />
                      <span>अनुभाग १: मासिक प्रतिवेदन (R.V. 1) अपलोड करें</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      सुरक्षित केंद्रीय रिपॉजिटरी (Central Repository)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        प्रतिवेदन माह व वर्ष *
                      </label>
                      <select
                        value={monthlyMonth}
                        onChange={(e) => setMonthlyMonth(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-red-500"
                      >
                        <option value="अगस्त 2026">अगस्त 2026</option>
                        <option value="सितम्बर 2026">सितम्बर 2026</option>
                        <option value="अक्टूबर 2026">अक्टूबर 2026</option>
                        <option value="नवम्बर 2026">नवम्बर 2026</option>
                        <option value="दिसम्बर 2026">दिसम्बर 2026</option>
                        <option value="जुलाई 2026">जुलाई 2026</option>
                        <option value="जून 2026">जून 2026</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        क्षेत्रीय कार्यालय / शाखा *
                      </label>
                      <select
                        value={monthlyRegion}
                        onChange={(e) => setMonthlyRegion(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-red-500"
                      >
                        {regions.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.nameHindi} ({reg.nameEnglish})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        प्रतिवेदन फ़ाइल चुनें *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.xlsx,.xls,.doc,.docx"
                        onChange={(e) => setMonthlyFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-100 file:text-red-800 hover:file:bg-red-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      विशेष विवरण / संदर्भ टिप्पणी (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      value={monthlyNotes}
                      onChange={(e) => setMonthlyNotes(e.target.value)}
                      placeholder="उदा. क्षेत्रीय कार्यालय द्वारा धारा 3(3) एवं हिंदी पत्राचार का शत्-प्रतिशत अनुपालन।"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      {monthlyFile ? `चयनित फ़ाइल: ${monthlyFile.name} (${(monthlyFile.size / 1024).toFixed(1)} KB)` : 'फ़ाइल समर्थित: PDF, Excel, Word'}
                    </span>
                    <button
                      type="submit"
                      disabled={monthlyUploading || !monthlyFile}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      {monthlyUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{monthlyUploading ? 'अपलोड हो रहा है...' : 'प्रतिवेदन जमा व अपलोड करें'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SEGMENT 2: BLANK TEMPLATE & SUBMITTED MONTHLY REPORTS */}
              <div className="space-y-4">
                {/* Blank Monthly Report Template Upload Segment (Admin controlled) */}
                <TabUploadSegment
                  tabKey="monthly_report"
                  tabTitle="मासिक प्रतिवेदन (R.V. 1) रिक्त प्रपत्र (Blank Template)"
                  placeholderTitle="उदा. आधिकारिक आर.वी. 1 प्रपत्र - मासिक प्रगति रिपोर्ट (Word / Excel / CSV / PDF)"
                  helpText="प्रशासक यहाँ से शाखाओं एवं क्षेत्रीय कार्यालयों हेतु आधिकारिक रिक्त आर.वी. 1 प्रपत्र (Word, Excel, CSV, PDF) अपलोड कर सकते हैं, जिसे उपयोक्ता डाउनलोड कर सकते हैं।"
                  defaultFormat="excel"
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  tabUploadedDocs={tabUploadedDocs}
                  onAddDoc={handleAddTabDoc}
                  onDeleteDoc={handleDeleteTabDoc}
                />

                {/* Submitted Monthly Reports List Sub-section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-700" />
                      <span>{isAdmin ? 'आंचलिक कार्यालय के समस्त प्राप्त मासिक प्रतिवेदन (स्थिति सूची):' : 'आपके द्वारा जमा किए गए मासिक प्रतिवेदन (स्थिति सूची):'}</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      कुल प्रेषित: {visibleMonthlyReports.length}
                    </span>
                  </div>

                  {!isAdmin && visibleMonthlyReports.length === 0 ? (
                    <div className="p-6 bg-amber-50/60 border border-dashed border-amber-300 rounded-xl text-center space-y-2">
                      <FileText className="w-8 h-8 text-amber-600 mx-auto opacity-75" />
                      <p className="font-bold text-slate-800 text-xs">
                        आपने अभी तक कोई मासिक प्रतिवेदन (R.V. 1) अपलोड नहीं किया है।
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        जैसे ही आप ऊपर दिए गए '+ नया मासिक प्रतिवेदन अपलोड करें' बटन से अपनी फ़ाइल जमा करेंगे, आपका प्रतिवेदन तुरंत यहाँ प्रदर्शित होगा।
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowMonthlyUploadCard(true)}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-xs mt-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>प्रतिवेदन अपलोड करें</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleMonthlyReports.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-red-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900">{rep.title}</p>
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px]">
                                {rep.branchOrOffice}
                              </span>
                              {rep.driveSyncStatus === 'synced' && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold text-[9px] flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>सत्यापित</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {rep.monthOrQuarter} • प्रेषक: {rep.uploadedBy} • {rep.uploadDate} • फ़ाइल: {rep.fileName}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(rep)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                              title="अपलोड किया गया प्रतिवेदन डाउनलोड करें"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>डाउनलोड</span>
                            </button>

                            {(isAdmin || rep.uploadedByEmail === currentUser?.email) && onDeleteReport && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`क्या आप '${rep.title}' हटाना चाहते हैं?`)) {
                                    onDeleteReport(rep.id);
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
            </div>
          )}

          {/* 3. QUARTERLY REPORT (QPR) - CLUBBED UPLOAD & DOWNLOAD HUB */}
          {modalType === 'quarterly_report' && (
            <div className="space-y-4 text-xs">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                    <span>तिमाही प्रगति रिपोर्ट (QPR): व्यक्तिगत अपलोड एवं डाउनलोड केंद्र</span>
                  </h4>
                  <p className="text-slate-600 mt-0.5">
                    भारत सरकार गृह मंत्रालय, राजभाषा विभाग विहित त्रैमासिक प्रगति रिपोर्ट प्रपत्र एवं अपलोड सुविधा।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQprUploadCard(!showQprUploadCard)}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0 self-start sm:self-auto"
                >
                  {showQprUploadCard ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  <span>{showQprUploadCard ? 'अपलोड फ़ॉर्म बंद करें' : '+ नया QPR प्रतिवेदन अपलोड करें'}</span>
                </button>
              </div>

              {/* Compliance Targets */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-500 block">क्षेत्र 'क' पत्राचार लक्ष्य</span>
                  <span className="text-sm font-black text-red-700">100%</span>
                </div>
                <div className="p-2 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-500 block">धारा 3(3) अनुपालन</span>
                  <span className="text-sm font-black text-emerald-700">100%</span>
                </div>
                <div className="p-2 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-500 block">हिंदी टिप्पणियां</span>
                  <span className="text-sm font-black text-blue-700">75%+</span>
                </div>
              </div>

              {/* Success / Error Banners */}
              {qprSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{qprSuccess}</span>
                  </div>
                  <button onClick={() => setQprSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {qprError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-semibold">{qprError}</span>
                  </div>
                  <button onClick={() => setQprError(null)} className="text-red-700 hover:text-red-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* SEGMENT 1: INLINE QPR UPLOAD FORM */}
              {showQprUploadCard && (
                <form onSubmit={handleQprUploadSubmit} className="p-4 bg-white border-2 border-blue-300 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>अनुभाग १: तिमाही प्रगति रिपोर्ट (QPR) अपलोड करें</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      सुरक्षित केंद्रीय रिपॉजिटरी (Central Repository)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        तिमाही अवधि *
                      </label>
                      <select
                        value={qprQuarter}
                        onChange={(e) => setQprQuarter(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="द्वितीय तिमाही (जुलाई - सितम्बर 2026)">द्वितीय तिमाही (जुलाई - सितम्बर 2026)</option>
                        <option value="तृतीय तिमाही (अक्टूबर - दिसम्बर 2026)">तृतीय तिमाही (अक्टूबर - दिसम्बर 2026)</option>
                        <option value="चतुर्थ तिमाही (जनवरी - मार्च 2027)">चतुर्थ तिमाही (जनवरी - मार्च 2027)</option>
                        <option value="प्रथम तिमाही (अप्रैल - जून 2026)">प्रथम तिमाही (अप्रैल - जून 2026)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        क्षेत्रीय कार्यालय / शाखा *
                      </label>
                      <select
                        value={qprRegion}
                        onChange={(e) => setQprRegion(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {regions.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.nameHindi} ({reg.nameEnglish})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        QPR फ़ाइल चुनें *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.xlsx,.xls,.doc,.docx"
                        onChange={(e) => setQprFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      टिप्पणी / संदर्भ (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      value={qprNotes}
                      onChange={(e) => setQprNotes(e.target.value)}
                      placeholder="उदा. गृह मंत्रालय पोर्टल पर ऑनलाइन प्रविष्टि पूर्ण की गई।"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      {qprFile ? `चयनित फ़ाइल: ${qprFile.name} (${(qprFile.size / 1024).toFixed(1)} KB)` : 'समर्थित: PDF, Excel, Word'}
                    </span>
                    <button
                      type="submit"
                      disabled={qprUploading || !qprFile}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      {qprUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{qprUploading ? 'अपलोड हो रहा है...' : 'QPR रिपोर्ट जमा व अपलोड करें'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SEGMENT 2: QPR UPLOAD & TEMPLATE HUB */}
              <div className="space-y-3">
                {/* Blank QPR Template Upload Segment (Admin controlled) */}
                <TabUploadSegment
                  tabKey="quarterly_report"
                  tabTitle="तिमाही प्रगति रिपोर्ट (QPR) रिक्त प्रपत्र (Blank Template)"
                  placeholderTitle="उदा. गृह मंत्रालय विहित आधिकारिक QPR रिक्त प्रपत्र (Excel / CSV / Word / PDF)"
                  helpText="प्रशासक यहाँ से गृह मंत्रालय विहित आधिकारिक रिक्त QPR प्रारूप (Word, Excel, CSV, PDF) अपलोड कर सकते हैं, जिसे उपयोक्ता डाउनलोड कर सकते हैं।"
                  defaultFormat="excel"
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  tabUploadedDocs={tabUploadedDocs}
                  onAddDoc={handleAddTabDoc}
                  onDeleteDoc={handleDeleteTabDoc}
                />

                {/* Submitted QPR Reports List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>{isAdmin ? 'आंचलिक कार्यालय के समस्त प्राप्त QPR प्रतिवेदन (स्थिति सूची):' : 'आपके द्वारा प्रस्तुत तिमाही प्रगति प्रतिवेदन (स्थिति सूची):'}</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      कुल प्रेषित: {visibleQuarterlyReports.length}
                    </span>
                  </div>

                  {!isAdmin && visibleQuarterlyReports.length === 0 ? (
                    <div className="p-6 bg-blue-50/60 border border-dashed border-blue-300 rounded-xl text-center space-y-2">
                      <FileText className="w-8 h-8 text-blue-600 mx-auto opacity-75" />
                      <p className="font-bold text-slate-800 text-xs">
                        आपने अभी तक कोई तिमाही प्रगति रिपोर्ट (QPR) अपलोड नहीं की है।
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        जैसे ही आप ऊपर दिए गए '+ नया QPR प्रतिवेदन अपलोड करें' बटन से अपनी रिपोर्ट जमा करेंगे, वह यहाँ प्रदर्शित होगी।
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowQprUploadCard(true)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-xs mt-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>QPR रिपोर्ट अपलोड करें</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleQuarterlyReports.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs hover:border-blue-300 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900">{rep.title}</p>
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                                {rep.branchOrOffice}
                              </span>
                              {rep.driveSyncStatus === 'synced' && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold text-[9px] flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>सत्यापित</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {rep.monthOrQuarter} • प्रेषक: {rep.uploadedBy} • {rep.uploadDate} • फ़ाइल: {rep.fileName}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(rep)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                              title="अपलोड किया गया प्रतिवेदन डाउनलोड करें"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>डाउनलोड</span>
                            </button>

                            {(isAdmin || rep.uploadedByEmail === currentUser?.email) && onDeleteReport && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`क्या आप '${rep.title}' हटाना चाहते हैं?`)) {
                                    onDeleteReport(rep.id);
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
            </div>
          )}

          {/* 4. E-MAGAZINE WITH DIRECT IN-PAGE READER & DOWNLOAD */}
          {modalType === 'emagazine' && (
            <MagazineReader 
              currentUser={currentUser} 
              onOpenUpload={onOpenUpload} 
            />
          )}

          {/* 5. OLIC */}
          {modalType === 'olic' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <h4 className="font-bold text-slate-900 mb-1">
                  राजभाषा कार्यान्वयन समिति (Official Language Implementation Committee - OLIC)
                </h4>
                <p className="text-slate-600">
                  आंचलिक प्रमुख (महाप्रबंधक) की अध्यक्षता में प्रत्येक तिमाही में राकास की बैठक आयोजित की जाती है जिसमें पिछले तिमाही के कार्यों की समीक्षा एवं आगामी लक्ष्यों पर निर्णय लिया जाता है।
                </p>
              </div>

              <div className="border rounded-lg p-3 bg-white space-y-2">
                <h5 className="font-bold text-slate-800">समिति के प्रमुख दायित्व:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>हिंदी में प्राप्त पत्रों के उत्तर 100% हिंदी में देना सुनिश्चित करना।</li>
                  <li>वेबसाइट, एटीएम स्क्रीन, पासबुक प्रिंटर आदि पर द्विभाषी इंटरफेस का निरीक्षण।</li>
                  <li>कर्मचारियों के लिए हिंदी कार्यशालाओं का नियमित आयोजन।</li>
                  <li>गृह पत्रिका का प्रकाशन एवं राजभाषा पखवाड़े का आयोजन।</li>
                </ul>
              </div>

              <TabUploadSegment
                tabKey="olic"
                tabTitle="राजभाषा कार्यान्वयन समिति (OLIC) कार्यवृत्त व प्रपत्र"
                placeholderTitle="उदा. राकास बैठक कार्यवृत्त एवं संकल्प प्रपत्र"
                helpText="प्रशासक यहाँ से राकास (OLIC) की बैठकों के आधिकारिक कार्यवृत्त एवं संकल्प प्रपत्र अपलोड कर सकते हैं।"
                defaultFormat="pdf"
                isAdmin={isAdmin}
                currentUser={currentUser}
                tabUploadedDocs={tabUploadedDocs}
                onAddDoc={handleAddTabDoc}
                onDeleteDoc={handleDeleteTabDoc}
              />
            </div>
          )}

          {/* 6. R.V. FORMAT */}
          {modalType === 'rv_format' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h3 className="font-bold text-sm text-red-950">
                  आर. वी. प्रारूप - क्षेत्रीय कार्यालय में पदस्थ राजभाषा प्रभारी का मासिक प्रतिवेदन
                </h3>
                <p className="text-slate-700 mt-1">
                  इस प्रपत्र में क्षेत्रीय कार्यालय के अंतर्गत आने वाली समस्त शाखाओं के पत्राचार, हिंदी में काम करने वाले अधिकारियों की संख्या, निरीक्षणों की स्थिति और हिंदी सॉफ़्टवेयर उपयोग का संकलित ब्यौरा भरा जाता है।
                </p>
              </div>

              <TabUploadSegment
                tabKey="rv_format"
                tabTitle="आर.वी. 1 निर्धारित रिक्त प्रारूप (Word / CSV / Excel)"
                placeholderTitle="उदा. आर.वी. 1 मासिक प्रतिवेदन रिक्त प्रपत्र (Word / CSV)"
                helpText="प्रशासक यहाँ से क्षेत्रीय कार्यालयों एवं शाखाओं हेतु रिक्त R.V. 1 प्रपत्र (Word, CSV अथवा Excel) आसानी से अपलोड कर सकते हैं।"
                defaultFormat="word"
                isAdmin={isAdmin}
                currentUser={currentUser}
                tabUploadedDocs={tabUploadedDocs}
                onAddDoc={handleAddTabDoc}
                onDeleteDoc={handleDeleteTabDoc}
              />
            </div>
          )}

          {/* 7. ANNUAL PROGRAMME */}
          {modalType === 'annual_programme' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-900 mb-1">
                  वार्षिक कार्यक्रम (Annual Programme) - राजभाषा विभाग, गृह मंत्रालय
                </h4>
                <p className="text-slate-700">
                  भारत सरकार द्वारा प्रत्येक वर्ष केंद्रीय कार्यालयों, बैंकों एवं उपक्रमों हेतु निर्धारित किए गए प्रमुख लक्ष्य:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 border rounded-lg flex justify-between">
                  <span className="font-medium">क्षेत्र 'क' में स्थित कार्यालयों को हिंदी पत्राचार</span>
                  <span className="font-bold text-red-700">100%</span>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg flex justify-between">
                  <span className="font-medium">क्षेत्र 'ख' में स्थित कार्यालयों को हिंदी पत्राचार</span>
                  <span className="font-bold text-blue-700">90%</span>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg flex justify-between">
                  <span className="font-medium">क्षेत्र 'ग' में स्थित कार्यालयों को हिंदी पत्राचार</span>
                  <span className="font-bold text-slate-700">55%</span>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg flex justify-between">
                  <span className="font-medium">हिंदी में टिप्पण (Notes in Hindi)</span>
                  <span className="font-bold text-emerald-700">75%</span>
                </div>
              </div>

              <TabUploadSegment
                tabKey="annual_programme"
                tabTitle="वार्षिक कार्यक्रम (गृह मंत्रालय) दस्तावेज़"
                placeholderTitle="उदा. वार्षिक कार्यक्रम 2026-27 एवं अनुपालन मार्गदर्शिका"
                helpText="प्रशासक यहाँ से गृह मंत्रालय द्वारा जारी आधिकारिक वार्षिक कार्यक्रम एवं लक्ष्य पुस्तिका अपलोड कर सकते हैं।"
                defaultFormat="pdf"
                isAdmin={isAdmin}
                currentUser={currentUser}
                tabUploadedDocs={tabUploadedDocs}
                onAddDoc={handleAddTabDoc}
                onDeleteDoc={handleDeleteTabDoc}
              />
            </div>
          )}

          {/* 8. MIS PORTAL */}
          {modalType === 'mis_portal' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-1">
                  सूचना प्रबंधन प्रणाली (MIS Portal - गृह मंत्रालय)
                </h4>
                <p className="text-slate-700">
                  राजभाषा विभाग, गृह मंत्रालय, भारत सरकार के आधिकारिक ऑनलाइन पोर्टल पर तिमाही प्रगति रिपोर्ट की ई-फाइलिंग स्थिति:
                </p>
              </div>

              <div className="p-3 border rounded-lg bg-white space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">पोर्टल URL:</span>
                  <a href="https://rajbhasha.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">
                    rajbhasha.gov.in
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">पटना अंचल कार्यालय कोड:</span>
                  <span className="font-mono font-bold">CBI-PAT-800001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">अंतिम तिमाही फाइलिंग स्थिति:</span>
                  <span className="text-emerald-700 font-bold">सत्यापित एवं स्वीकृत (Verified)</span>
                </div>
              </div>

              <TabUploadSegment
                tabKey="mis_portal"
                tabTitle="सूचना प्रबंधन प्रणाली (MIS Portal) दिशानिर्देश"
                placeholderTitle="उदा. MIS पोर्टल ई-फाइलिंग मार्गदर्शिका एवं दिशानिर्देश"
                helpText="प्रशासक यहाँ से MIS पोर्टल फाइलिंग दिशानिर्देश एवं प्रपत्र अपलोड कर सकते हैं।"
                defaultFormat="pdf"
                isAdmin={isAdmin}
                currentUser={currentUser}
                tabUploadedDocs={tabUploadedDocs}
                onAddDoc={handleAddTabDoc}
                onDeleteDoc={handleDeleteTabDoc}
              />
            </div>
          )}

          {/* 9. HINDI WORKSHOP */}
          {modalType === 'hindi_workshop' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <h4 className="font-bold text-slate-900 mb-1">हिंदी कार्यशाला (Hindi Workshop)</h4>
                <p className="text-slate-600">
                  कर्मचारियों के दैनिक बैंकिंग कार्यों में हिंदी के उपयोग को सहज बनाने के लिए प्रत्येक तिमाही में 1 दिवसीय हिंदी कार्यशाला का आयोजन अनिवार्य है।
                </p>
              </div>

              <div className="border rounded-lg p-3 bg-white space-y-2">
                <h5 className="font-bold text-slate-800">कार्यशाला के प्रमुख विषय:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>यूनिकोड आधारित हिंदी टाइपिंग (Google Input Tools एवं Inscript कीबोर्ड)</li>
                  <li>बैंकिंग पत्राचार एवं ऋण प्रस्तावों में सरल प्रशासनिक शब्दावली का प्रयोग</li>
                  <li>राजभाषा अधिनियम 1963 एवं नियम 1976 के प्रमुख प्रावधान</li>
                </ul>
              </div>

              <TabUploadSegment
                tabKey="hindi_workshop"
                tabTitle="हिंदी कार्यशाला प्रशिक्षण सामग्री व अभ्यास प्रपत्र"
                placeholderTitle="उदा. कार्यशाला प्रशिक्षण हैंडआउट, अभ्यास प्रपत्र व पीपीटी"
                helpText="प्रशासक यहाँ से हिंदी कार्यशाला प्रशिक्षण सामग्री, अभ्यास प्रपत्र व प्रस्तुतियां अपलोड कर सकते हैं।"
                defaultFormat="word"
                isAdmin={isAdmin}
                currentUser={currentUser}
                tabUploadedDocs={tabUploadedDocs}
                onAddDoc={handleAddTabDoc}
                onDeleteDoc={handleDeleteTabDoc}
              />
            </div>
          )}

          {/* 10. TOLIC */}
          {modalType === 'tolic' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-950 mb-1">
                  नगर राजभाषा कार्यान्वयन समिति (नराकास / TOLIC - बैंक), पटना
                </h4>
                <p className="text-slate-700">
                  पटना नगर में स्थित समस्त राष्ट्रीयकृत बैंकों, वित्तीय संस्थानों एवं नाबार्ड/सिडबी का संयुक्त मंच, जो संयुक्त रूप से राजभाषा के संवर्धन हेतु कार्यरत है।
                </p>
              </div>

              <div className="border rounded-lg p-3 bg-white space-y-1.5 text-slate-700">
                <p><strong>अध्यक्ष बैंक:</strong> पंजाब नेशनल बैंक / भारतीय स्टेट बैंक (पटना)</p>
                <p><strong>सक्रिय सदस्य:</strong> सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना</p>
                <p><strong>आयोजित गतिविधियां:</strong> अंतर-बैंक हिंदी निबंध, वाद-विवाद, तात्कालिक भाषण प्रतियोगिताएं एवं संयुक्त समीक्षा बैठक।</p>
              </div>

              <TabUploadSegment
                tabKey="tolic"
                tabTitle="नगर राजभाषा कार्यान्वयन समिति (TOLIC) विवरण"
                placeholderTitle="उदा. नराकास पटना संयुक्त बैठक विवरण एवं प्रतियोगिता सूचना"
                helpText="प्रशासक यहाँ से नराकास (TOLIC) पटना की संयुक्त बैठक रिपोर्ट एवं प्रतियोगिता परिपत्र अपलोड कर सकते हैं।"
                defaultFormat="pdf"
                isAdmin={isAdmin}
                currentUser={currentUser}
                tabUploadedDocs={tabUploadedDocs}
                onAddDoc={handleAddTabDoc}
                onDeleteDoc={handleDeleteTabDoc}
              />
            </div>
          )}

          {/* 11. CIRCULARS */}
          {modalType === 'circulars' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-purple-950 text-sm mb-0.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-700" />
                    <span>राजभाषा विभाग परिपत्र एवं दिशा-निर्देश (Circulars Hub)</span>
                  </h4>
                  <p className="text-slate-600">
                    केंद्रीय कार्यालय, आंचलिक कार्यालय पटना एवं भारत सरकार द्वारा जारी आधिकारिक परिपत्र व आदेश।
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {circularsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadCircularsCsv}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>समस्त परिपत्र डाउनलोड (CSV)</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddCircularModal(!showAddCircularModal)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      {showAddCircularModal ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{showAddCircularModal ? 'फ़ॉर्म बंद करें' : '+ परिपत्र अपलोड करें'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Success Toast */}
              {actionSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* ADMIN ADD CIRCULAR FORM */}
              {isAdmin && showAddCircularModal && (
                <div className="p-4 bg-purple-50/70 border border-purple-300 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                    <Edit3 className="w-4 h-4" />
                    <span>मुख्य प्रशासक: नया परिपत्र अथवा आधिकारिक आदेश प्रकाशित करें</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        परिपत्र क्रमांक (Circular No.) *
                      </label>
                      <input
                        type="text"
                        value={newCircNo}
                        onChange={(e) => setNewCircNo(e.target.value)}
                        placeholder="उदा. परिपत्र सं. 15/2026"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        जारी दिनांक *
                      </label>
                      <input
                        type="text"
                        value={newCircDate}
                        onChange={(e) => setNewCircDate(e.target.value)}
                        placeholder="उदा. 05 सितम्बर 2026"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      विषय / शीर्षक (Subject) *
                    </label>
                    <input
                      type="text"
                      value={newCircTitle}
                      onChange={(e) => setNewCircTitle(e.target.value)}
                      placeholder="उदा. हिंदी में मूल पत्राचार एवं त्रैमासिक समीक्षा बाबत"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      परिपत्र विवरण / मुख्य निर्देश *
                    </label>
                    <textarea
                      rows={3}
                      value={newCircSummary}
                      onChange={(e) => setNewCircSummary(e.target.value)}
                      placeholder="परिपत्र के मुख्य बिंदु, अनुपालन निर्देश अथवा आधिकारिक आदेश का पूर्ण पाठ दर्ज करें..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      आधिकारिक परिपत्र दस्तावेज़ फ़ाइल संलग्न करें (PDF / DOC / TXT)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setNewCircFile({
                                name: file.name,
                                dataUrl: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                      />
                      {newCircFile && (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {newCircFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-purple-200">
                    <button
                      type="button"
                      onClick={() => setShowAddCircularModal(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCircNo.trim() || !newCircTitle.trim()) {
                          alert('कृपया परिपत्र संख्या एवं विषय अवश्य भरें।');
                          return;
                        }
                        const newCirc: CustomCircular = {
                          id: 'circ-' + Date.now(),
                          circularNo: newCircNo.trim(),
                          date: newCircDate.trim(),
                          title: newCircTitle.trim(),
                          summary: newCircSummary.trim(),
                          fileName: newCircFile?.name,
                          fileDataUrl: newCircFile?.dataUrl,
                        };
                        const updated = [newCirc, ...circularsList];
                        setCircularsList(updated);
                        localStorage.setItem('rajbhasha_custom_circulars', JSON.stringify(updated));
                        setNewCircNo('');
                        setNewCircTitle('');
                        setNewCircSummary('');
                        setNewCircFile(null);
                        setShowAddCircularModal(false);
                        showActionToast('✓ नया परिपत्र सफलतापूर्वक अपलोड व प्रकाशित कर दिया गया है।');
                      }}
                      className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                      परिपत्र प्रकाशित करें
                    </button>
                  </div>
                </div>
              )}

              {/* Circulars List */}
              {circularsList.length === 0 ? (
                <div className="p-8 bg-purple-50/50 border border-dashed border-purple-300 rounded-xl text-center space-y-2">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto opacity-75" />
                  <p className="font-bold text-slate-800 text-xs">
                    वर्तमान में कोई आधिकारिक परिपत्र अथवा दिशा-निर्देश उपलब्ध नहीं है।
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    {isAdmin
                      ? "प्रशासक के रूप में आप ऊपर दिए गए '+ परिपत्र अपलोड करें' बटन का उपयोग करके नया परिपत्र प्रकाशित कर सकते हैं।"
                      : 'आंचलिक कार्यालय द्वारा जब नया परिपत्र अपलोड किया जाएगा, तभी वह यहाँ उपलब्ध होगा।'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {circularsList.map((circ) => (
                    <div key={circ.id} className="p-3 border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{circ.circularNo}</span>
                          {circ.id.startsWith('circ-') && !circ.id.includes('2026') && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[9px] font-bold">
                              व्यवस्थापक द्वारा अपलोड
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-800 text-xs">{circ.title}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{circ.summary}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                          {circ.date}
                        </span>
                        {circ.fileDataUrl ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadGenericSample(circ.title, circ.fileDataUrl)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>डाउनलोड</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">फ़ाइल संलग्न नहीं</span>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`क्या आप '${circ.circularNo}' हटाना चाहते हैं?`)) {
                                const filtered = circularsList.filter(c => c.id !== circ.id);
                                setCircularsList(filtered);
                                localStorage.setItem('rajbhasha_custom_circulars', JSON.stringify(filtered));
                                showActionToast('परिपत्र सफलतापूर्वक हटा दिया गया है।');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
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
          )}

          {/* 12. AUTHOR OF THE MONTH */}
          {modalType === 'author_of_month' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                  इस माह के चयनित साहित्यकार (मासिक साहित्यिक स्तंभ)
                </span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditAuthorForm(authorData);
                      setShowEditAuthorModal(!showEditAuthorModal);
                    }}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{showEditAuthorModal ? 'संपादन बंद करें' : 'साहित्यकार विवरण व रचना दस्तावेज़ संपादित करें'}</span>
                  </button>
                )}
              </div>

              {/* Toast */}
              {actionSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* ADMIN EDIT AUTHOR FORM */}
              {isAdmin && showEditAuthorModal && (
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <Edit3 className="w-4 h-4" />
                    <span>मुख्य प्रशासक: इस माह के साहित्यकार एवं रचना दस्तावेज़ अपलोड/संपादित करें</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        साहित्यकार का नाम (हिंदी) *
                      </label>
                      <input
                        type="text"
                        value={editAuthorForm.hindiName}
                        onChange={(e) => setEditAuthorForm({ ...editAuthorForm, hindiName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        नाम (अंग्रेजी) *
                      </label>
                      <input
                        type="text"
                        value={editAuthorForm.englishName}
                        onChange={(e) => setEditAuthorForm({ ...editAuthorForm, englishName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        जन्मस्थान / कर्मभूमि
                      </label>
                      <input
                        type="text"
                        value={editAuthorForm.birthPlace}
                        onChange={(e) => setEditAuthorForm({ ...editAuthorForm, birthPlace: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        काल / युग
                      </label>
                      <input
                        type="text"
                        value={editAuthorForm.era}
                        onChange={(e) => setEditAuthorForm({ ...editAuthorForm, era: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      लोकप्रिय उद्धरण / सुविचार *
                    </label>
                    <textarea
                      rows={2}
                      value={editAuthorForm.popularQuote}
                      onChange={(e) => setEditAuthorForm({ ...editAuthorForm, popularQuote: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      जीवन परिचय एवं साहित्यिक योगदान *
                    </label>
                    <textarea
                      rows={3}
                      value={editAuthorForm.bio}
                      onChange={(e) => setEditAuthorForm({ ...editAuthorForm, bio: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      प्रमुख कृतियां (अल्पविराम ',' से अलग करें)
                    </label>
                    <input
                      type="text"
                      value={editAuthorForm.famousWorks.join(', ')}
                      onChange={(e) => setEditAuthorForm({ 
                        ...editAuthorForm, 
                        famousWorks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        साहित्यकार की फ़ोटो (URL या फ़ाइल)
                      </label>
                      <input
                        type="text"
                        value={editAuthorForm.image}
                        onChange={(e) => setEditAuthorForm({ ...editAuthorForm, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        रचना दस्तावेज़ अपलोड (PDF / DOC / TXT)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setEditAuthorForm({
                                ...editAuthorForm,
                                docTitle: `${editAuthorForm.hindiName} - चयनित रचना संकलन`,
                                docFileName: file.name,
                                docDataUrl: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => setShowEditAuthorModal(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthorData(editAuthorForm);
                        localStorage.setItem('rajbhasha_custom_author', JSON.stringify(editAuthorForm));
                        setShowEditAuthorModal(false);
                        showActionToast('✓ साहित्यकार विवरण व रचना दस्तावेज़ सफलतापूर्वक सहेज दिए गए हैं।');
                      }}
                      className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>सहेजें एवं प्रकाशित करें</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Author Display Card */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <img
                  src={authorData.image}
                  alt={authorData.hindiName}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-md border-2 border-white shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                    इस माह के चयनित साहित्यकार
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                    {authorData.hindiName}
                  </h3>
                  <p className="text-slate-600 font-medium mt-1">
                    {authorData.birthPlace} • {authorData.era}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-100/60 border border-amber-300/80 rounded-xl italic text-slate-800 text-xs font-serif leading-relaxed">
                "{authorData.popularQuote}"
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">जीवन परिचय एवं योगदान:</h4>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {authorData.bio}
                </p>

                <h4 className="font-bold text-slate-900 text-xs pt-1">कालजयी कृतियां:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {authorData.famousWorks.map((work, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-950 font-semibold text-[11px]"
                    >
                      {work}
                    </span>
                  ))}
                </div>

                {/* Download Author Literature Document */}
                <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-red-50 border border-amber-300 rounded-xl flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block text-xs">
                      {authorData.docTitle || `${authorData.hindiName} - चयनित रचना संकलन`}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      साहित्यकार का मूल पाठ, प्रमुख कहानियां एवं जीवनी संदर्भ सामग्री
                    </span>
                  </div>
                  {authorData.docDataUrl ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadGenericSample(
                        authorData.docTitle || `${authorData.hindiName} - साहित्यिक संकलन`,
                        authorData.docDataUrl
                      )}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>साहित्य दस्तावेज़ डाउनलोड करें</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      {isAdmin ? 'प्रशासक संपादन विकल्प से दस्तावेज़ संलग्न कर सकते हैं' : 'दस्तावेज़ संलग्न नहीं'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 13. ADMINISTRATIVE GLOSSARY */}
          {modalType === 'admin_glossary' && (
            <div className="space-y-3 text-xs">
              {/* Glossary Download Segment */}
              <div className="p-3.5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-red-950 text-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-red-700" />
                    <span>प्रशासनिक शब्दावली डाउनलोड खंड (Glossary Download Segment)</span>
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    बैंक पत्राचार एवं टिप्पणी हेतु प्रयुक्त मानक प्रशासनिक शब्दावली (कुल {ADMINISTRATIVE_GLOSSARY.length} शब्द उपलब्ध)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAdminGlossaryCsv}
                  className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>शब्दावली डाउनलोड करें (CSV / Excel)</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="अंग्रेजी या हिंदी प्रशासनिक शब्द खोजें (उदा. Approval, पावती, Compliance)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>

              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredAdminGlossary.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-sm text-red-900">{item.english}</span>
                      <span className="font-extrabold text-sm text-slate-900">{item.hindi}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{item.meaning}</p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[11px] text-slate-700 italic">
                      <strong>वाक्य प्रयोग:</strong> "{item.exampleSentence}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. BANKING GLOSSARY (RBI & ADMIN UPLOAD) */}
          {modalType === 'banking_glossary' && (
            <div className="space-y-3 text-xs">
              {/* Banking Glossary Download & Upload Clubbed Segment */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>बैंकिंग शब्दावली डाउनलोड खंड (Banking Glossary Download Hub)</span>
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    भारतीय रिज़र्व बैंक (RBI) व सेन्ट्रल बैंक मानक बैंकिंग शब्दावली (कुल {allBankingGlossary.length} पद व संदर्भ सामग्री)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadBankingGlossaryCsv}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>शब्दावली डाउनलोड करें (CSV)</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddBankingModal(!showAddBankingModal)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                    >
                      {showAddBankingModal ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{showAddBankingModal ? 'फ़ॉर्म बंद करें' : '+ शब्द / दस्तावेज़ जोड़ें'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Toast */}
              {actionSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* ADMIN ADD BANKING MODAL / PANEL */}
              {isAdmin && showAddBankingModal && (
                <div className="p-4 bg-blue-50/70 border border-blue-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <span className="font-bold text-blue-950 text-xs">
                      मुख्य प्रशासक: बैंकिंग शब्दावली दस्तावेज़ या पारिभाषिक शब्द जोड़ें
                    </span>
                    <div className="flex rounded-lg overflow-hidden border border-blue-300 bg-white">
                      <button
                        type="button"
                        onClick={() => setBankingAddTab('doc')}
                        className={`px-2.5 py-1 font-bold text-[11px] ${bankingAddTab === 'doc' ? 'bg-blue-700 text-white' : 'text-blue-900 hover:bg-blue-50'}`}
                      >
                        दस्तावेज़ अपलोड (Doc)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankingAddTab('term')}
                        className={`px-2.5 py-1 font-bold text-[11px] ${bankingAddTab === 'term' ? 'bg-blue-700 text-white' : 'text-blue-900 hover:bg-blue-50'}`}
                      >
                        पारिभाषिक शब्द (Term)
                      </button>
                    </div>
                  </div>

                  {bankingAddTab === 'doc' ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          दस्तावेज़ का नाम / शीर्षक *
                        </label>
                        <input
                          type="text"
                          value={newBankDocTitle}
                          onChange={(e) => setNewBankDocTitle(e.target.value)}
                          placeholder="उदा. भारतीय रिज़र्व बैंक मानक बैंकिंग शब्दावली पुस्तिका 2026"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          विवरण / संदर्भ टिप्पणी
                        </label>
                        <input
                          type="text"
                          value={newBankDocDesc}
                          onChange={(e) => setNewBankDocDesc(e.target.value)}
                          placeholder="उदा. समस्त शाखाओं हेतु अनिवार्य बैंकिंग पारिभाषिक संदर्भ हैंडबुक"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          दस्तावेज़ फ़ाइल चुनें (PDF / DOC / CSV / TXT)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setNewBankDocFile({
                                  name: file.name,
                                  dataUrl: reader.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                        />
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newBankDocTitle.trim()) {
                              alert('कृपया दस्तावेज़ का शीर्षक दर्ज करें।');
                              return;
                            }
                            const newDoc: CustomBankingDoc = {
                              id: 'bdoc-' + Date.now(),
                              title: newBankDocTitle.trim(),
                              description: newBankDocDesc.trim(),
                              fileName: newBankDocFile?.name || `${newBankDocTitle.trim()}.pdf`,
                              fileDataUrl: newBankDocFile?.dataUrl,
                              date: new Date().toLocaleDateString('hi-IN'),
                            };
                            const updated = [newDoc, ...customBankingDocs];
                            setCustomBankingDocs(updated);
                            localStorage.setItem('rajbhasha_custom_banking_docs', JSON.stringify(updated));
                            setNewBankDocTitle('');
                            setNewBankDocDesc('');
                            setNewBankDocFile(null);
                            setShowAddBankingModal(false);
                            showActionToast('✓ बैंकिंग संदर्भ दस्तावेज़ सफलतापूर्वक अपलोड कर दिया गया है।');
                          }}
                          className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs"
                        >
                          दस्तावेज़ प्रकाशित करें
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            अंग्रेजी शब्द (English Term) *
                          </label>
                          <input
                            type="text"
                            value={newBankEnglish}
                            onChange={(e) => setNewBankEnglish(e.target.value)}
                            placeholder="उदा. Forex Reserves"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            हिंदी मानक अनुवाद *
                          </label>
                          <input
                            type="text"
                            value={newBankHindi}
                            onChange={(e) => setNewBankHindi(e.target.value)}
                            placeholder="उदा. विदेशी मुद्रा भंडार"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          अर्थ / परिभाषा *
                        </label>
                        <input
                          type="text"
                          value={newBankMeaning}
                          onChange={(e) => setNewBankMeaning(e.target.value)}
                          placeholder="उदा. केंद्रीय बैंक द्वारा धारित विदेशी मुद्रा और स्वर्ण परिसंपत्तियां"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          बैंकिंग वाक्य प्रयोग *
                        </label>
                        <input
                          type="text"
                          value={newBankSentence}
                          onChange={(e) => setNewBankSentence(e.target.value)}
                          placeholder="उदा. देश का विदेशी मुद्रा भंडार नए रिकॉर्ड स्तर पर पहुंच गया है।"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newBankEnglish.trim() || !newBankHindi.trim()) {
                              alert('कृपया अंग्रेजी एवं हिंदी शब्द अवश्य भरें।');
                              return;
                            }
                            const newTerm: GlossaryItem = {
                              id: 'bterm-' + Date.now(),
                              english: newBankEnglish.trim(),
                              hindi: newBankHindi.trim(),
                              meaning: newBankMeaning.trim(),
                              exampleSentence: newBankSentence.trim(),
                              category: 'banking',
                            };
                            const updated = [newTerm, ...customBankingTerms];
                            setCustomBankingTerms(updated);
                            localStorage.setItem('rajbhasha_custom_banking_glossary', JSON.stringify(updated));
                            setNewBankEnglish('');
                            setNewBankHindi('');
                            setNewBankMeaning('');
                            setNewBankSentence('');
                            setShowAddBankingModal(false);
                            showActionToast('✓ नया बैंकिंग शब्द सफलतापूर्वक जोड़ दिया गया है।');
                          }}
                          className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs"
                        >
                          शब्द जोड़ें
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Banking Documents Section */}
              {customBankingDocs.length > 0 && (
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-700" />
                      <span>आधिकारिक बैंकिंग शब्दावली संदर्भ दस्तावेज़ (Admin Reference Documents):</span>
                    </h5>
                    <span className="text-[10px] text-blue-800 font-semibold">{customBankingDocs.length} दस्तावेज़</span>
                  </div>
                  <div className="space-y-1.5">
                    {customBankingDocs.map((doc) => (
                      <div key={doc.id} className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{doc.title}</p>
                          {doc.description && <p className="text-[10px] text-slate-500">{doc.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{doc.date}</span>
                          {doc.fileDataUrl ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadGenericSample(doc.title, doc.fileDataUrl)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>डाउनलोड</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">फ़ाइल संलग्न नहीं</span>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`दस्तावेज़ '${doc.title}' हटाएं?`)) {
                                  const filtered = customBankingDocs.filter(d => d.id !== doc.id);
                                  setCustomBankingDocs(filtered);
                                  localStorage.setItem('rajbhasha_custom_banking_docs', JSON.stringify(filtered));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bankingSearch}
                  onChange={(e) => setBankingSearch(e.target.value)}
                  placeholder="बैंकिंग शब्द खोजें (उदा. NPA, Collateral, सावधि जमा, Balance, Forex)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                {filteredBankingGlossary.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-blue-900">{item.english}</span>
                        {item.id.startsWith('bterm-') && (
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">
                            व्यवस्थापक द्वारा जोड़ा गया
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-sm text-slate-900">{item.hindi}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{item.meaning}</p>
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[11px] text-slate-700 italic">
                      <strong>बैंकिंग वाक्य प्रयोग:</strong> "{item.exampleSentence}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 15. THOUGHT OF THE DAY */}
          {modalType === 'thought_of_day' && (
            <div className="space-y-4 text-center py-2">
              <div className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border border-amber-300 rounded-2xl shadow-inner relative">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-widest block mb-2">
                  आज का प्रेरक सुविचार (Thought of the Day)
                </span>

                <blockquote className="text-lg sm:text-xl font-extrabold text-slate-900 font-serif leading-relaxed px-2">
                  "{THOUGHT_OF_THE_DAY.hindi}"
                </blockquote>

                <p className="text-xs text-slate-600 mt-3 max-w-lg mx-auto italic">
                  {THOUGHT_OF_THE_DAY.english}
                </p>

                <div className="mt-4 pt-3 border-t border-amber-200 text-xs font-bold text-amber-950">
                  — {THOUGHT_OF_THE_DAY.author}
                </div>
              </div>

              {/* Audio Playback Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSpeakThought}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-full flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingAudio ? 'ध्वनि बज रही है...' : 'हिंदी में सुविचार सुनें (Listen)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
