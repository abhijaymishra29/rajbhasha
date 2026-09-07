import React, { useState } from 'react';
import { RegionOption } from '../data/defaultData';
import { getStoredRegions, addRegion, deleteRegion, resetRegions } from '../services/regionService';
import { getRegisteredUsers } from '../services/firebaseAuth';
import { downloadPasswordSheet } from '../services/driveService';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  X, 
  Building2, 
  Users, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface AdminRegionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegionsUpdated: (newRegions: RegionOption[]) => void;
}

export const AdminRegionManagerModal: React.FC<AdminRegionManagerModalProps> = ({
  isOpen,
  onClose,
  onRegionsUpdated,
}) => {
  const [regions, setRegions] = useState<RegionOption[]>(() => getStoredRegions());
  const [newHindiName, setNewHindiName] = useState('');
  const [newEnglishName, setNewEnglishName] = useState('');
  const [newOfficeType, setNewOfficeType] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const registeredUsers = getRegisteredUsers();

  const handleAddRegion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newHindiName.trim() || !newEnglishName.trim()) {
      setErrorMsg('कृपया क्षेत्र का नाम हिंदी और अंग्रेजी दोनों में दर्ज करें।');
      return;
    }

    const res = addRegion({
      nameHindi: newHindiName.trim(),
      nameEnglish: newEnglishName.trim(),
      officeType: newOfficeType.trim() || `क्षेत्रीय कार्यालय ${newHindiName.trim()}`,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'क्षेत्र जोड़ने में त्रुटि हुई।');
      return;
    }

    setRegions(res.regions);
    onRegionsUpdated(res.regions);
    setSuccessMsg(`नया क्षेत्र '${newHindiName.trim()}' सफलतापूर्वक जोड़ा गया!`);
    setNewHindiName('');
    setNewEnglishName('');
    setNewOfficeType('');
  };

  const handleDeleteRegion = (regionId: string, regionName: string) => {
    if (!window.confirm(`क्या आप निश्चित रूप से क्षेत्र '${regionName}' को हटाना चाहते हैं?`)) {
      return;
    }

    const res = deleteRegion(regionId);
    setRegions(res.regions);
    onRegionsUpdated(res.regions);
    setSuccessMsg(`क्षेत्र '${regionName}' सफलतापूर्वक हटा दिया गया।`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('क्या आप सभी क्षेत्रों को मूल 10 डिफ़ॉल्ट क्षेत्रों पर रीसेट करना चाहते हैं?')) {
      const resetList = resetRegions();
      setRegions(resetList);
      onRegionsUpdated(resetList);
      setSuccessMsg('क्षेत्र सूची मूल 10 क्षेत्रों पर रीसेट कर दी गई है।');
    }
  };

  const handleDownloadSheet = () => {
    downloadPasswordSheet(registeredUsers);
    setSuccessMsg('उपयोक्ता क्रेडेंशियल स्प्रेडशीट (.CSV) फ़ाइल डाउनलोड हो गई है!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-amber-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <MapPin className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">क्षेत्र प्रबंधन (Region Management)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-red-950">
                  एडमिन मोड
                </span>
              </div>
              <p className="text-xs text-white/80">
                नए क्षेत्र जोड़ें, हटाएं अथवा पासवर्ड रजिस्ट्री स्प्रेडशीट डाउनलोड करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Quick Action: Download Registered Users Password Sheet */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  उपयोक्ता पासवर्ड स्प्रेडशीट (Google Sheet Registry)
                </h3>
                <p className="text-[11px] text-slate-600">
                  प्रशासनिक पासवर्ड रजिस्ट्री • कुल पंजीकृत उपयोक्ता: {registeredUsers.length}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadSheet}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>स्प्रेडशीट (.CSV) डाउनलोड करें</span>
            </button>
          </div>

          {/* Form to Add New Region */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
              <Plus className="w-4 h-4 text-red-700" />
              <span>नया क्षेत्र जोड़ें (Add New Region)</span>
            </h3>

            <form onSubmit={handleAddRegion} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  क्षेत्र नाम हिंदी में (Hindi Name): *
                </label>
                <input
                  type="text"
                  required
                  value={newHindiName}
                  onChange={(e) => setNewHindiName(e.target.value)}
                  placeholder="उदा. भागलपुर"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  English Name (अंग्रेजी नाम): *
                </label>
                <input
                  type="text"
                  required
                  value={newEnglishName}
                  onChange={(e) => setNewEnglishName(e.target.value)}
                  placeholder="e.g. Bhagalpur"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  कार्यालय विवरण (Office Type):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOfficeType}
                    onChange={(e) => setNewOfficeType(e.target.value)}
                    placeholder="उदा. क्षेत्रीय कार्यालय भागलपुर"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                  >
                    जोड़ें
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of Active Regions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>सक्रिय क्षेत्र सूची (Active Regions List - {regions.length})</span>
              </h3>

              <button
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-500 hover:text-red-700 flex items-center gap-1 underline transition-colors"
                title="10 मूल क्षेत्रों पर रीसेट करें"
              >
                <RotateCcw className="w-3 h-3" />
                <span>मूल 10 क्षेत्रों पर रीसेट करें</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {regions.map((reg) => {
                const userCount = registeredUsers.filter(
                  (u: any) => u.region === reg.id || (u.regionHindi && u.regionHindi.includes(reg.nameEnglish))
                ).length;

                return (
                  <div
                    key={reg.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-red-300 hover:shadow-xs transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-red-800 flex items-center justify-center font-bold text-xs">
                        {reg.nameEnglish.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{reg.nameHindi}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{reg.officeType}</span>
                          {userCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                              <Users className="w-2.5 h-2.5" />
                              {userCount} उपयोक्ता
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRegion(reg.id, reg.nameHindi)}
                      title={`क्षेत्र ${reg.nameHindi} हटाएं`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            क्षेत्र में परिवर्तन तुरंत ड्रॉपडाउन एवं पंजीकरण फॉर्म में लागू हो जाता है।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
