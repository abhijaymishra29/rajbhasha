import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { 
  DEFAULT_ADMIN_PASSWORD 
} from '../data/defaultData';
import { getStoredRegions } from '../services/regionService';
import { 
  loginWithCredentials, 
  registerNewUser, 
  signInWithGoogle, 
  getRegisteredUsers 
} from '../services/firebaseAuth';
import { downloadPasswordSheet } from '../services/driveService';
import { 
  ShieldCheck, 
  User as UserIcon, 
  UserPlus, 
  Lock, 
  Building2, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  FileSpreadsheet,
  Download,
  Info,
  Sparkles
} from 'lucide-react';

interface InitialAuthScreenProps {
  onLoginSuccess: (user: AuthUser, token?: string) => void;
}

export const InitialAuthScreen: React.FC<InitialAuthScreenProps> = ({ onLoginSuccess }) => {
  const [regions, setRegions] = useState(() => getStoredRegions());
  const [activeTab, setActiveTab] = useState<'user_login' | 'admin_login' | 'create_user'>('user_login');

  // Refresh regions if changed
  useEffect(() => {
    setRegions(getStoredRegions());
  }, [activeTab]);

  // User login states - NO hardcoded passwords, clean user entry
  const [userSelectedRegion, setUserSelectedRegion] = useState<string>(() => regions[0]?.id || 'patna');
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [userPasswordInput, setUserPasswordInput] = useState<string>('');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Admin login states
  const [adminIdInput, setAdminIdInput] = useState<string>('admin@rajbhasha.in');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('Admin@Patna#CBI800');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminSecretHint, setShowAdminSecretHint] = useState(false);

  // Create user states
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newDesignation, setNewDesignation] = useState('राजभाषा अधिकारी');
  const [newRegion, setNewRegion] = useState<string>(() => regions[0]?.id || 'patna');
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdUserNotice, setCreatedUserNotice] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setCreatedUserNotice(null);
  };

  // When region changes in login dropdown, update suggested placeholder
  const handleRegionChangeInLogin = (regId: string) => {
    setUserSelectedRegion(regId);
    clearMessages();
    
    // Check if any user already registered for this region
    const registered = getRegisteredUsers();
    const found = registered.find((u: any) => u.region === regId);
    if (found) {
      setUserIdInput(found.emailOrUsername || found.email || '');
    } else {
      setUserIdInput(`${regId}@cbi.co.in`);
    }
  };

  // 1. Handle User Login
  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const regUsers = getRegisteredUsers();
      
      // Check if trying to login by region
      const registeredForRegion = regUsers.find((u: any) => u.region === userSelectedRegion);
      
      // If user provided custom username or email, use that, otherwise use region ID
      const identifierToTry = userIdInput.trim() || userSelectedRegion;
      const user = loginWithCredentials(identifierToTry, userPasswordInput);

      if (user) {
        onLoginSuccess(user);
      } else {
        if (!registeredForRegion) {
          setErrorMessage(
            `क्षेत्र '${regions.find(r => r.id === userSelectedRegion)?.nameHindi || userSelectedRegion}' हेतु अभी तक पासवर्ड नहीं बनाया गया है। कृपया 'नया उपयोक्ता बनाएं' पर जाकर पंजीकरण करें एवं अपना पासवर्ड बनाएं।`
          );
        } else {
          setErrorMessage('गलत पासवर्ड या उपयोक्ता आईडी। कृपया सही पासवर्ड दर्ज करें अथवा नया खाता पंजीकृत करें।');
        }
      }
    } catch {
      setErrorMessage('लॉगिन करने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Admin Login
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      const user = loginWithCredentials(adminIdInput, adminPasswordInput);
      if (user && user.role === 'admin') {
        onLoginSuccess(user);
      } else {
        setErrorMessage('अमान्य प्रशासक क्रेडेंशियल। कृपया सही एडमिन पासवर्ड दर्ज करें।');
      }
    } catch {
      setErrorMessage('प्रशासक लॉगिन में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Create User & Save Password in Google Sheet
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newOfficerName.trim()) {
      setErrorMessage('कृपया अधिकारी का नाम दर्ज करें।');
      return;
    }

    if (!newUserId.trim()) {
      setErrorMessage('कृपया उपयोक्ता आईडी या ईमेल दर्ज करें।');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setErrorMessage('पासवर्ड एवं पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    const regionObj = regions.find((r) => r.id === newRegion);
    const result = registerNewUser({
      name: newOfficerName.trim(),
      designation: newDesignation.trim(),
      emailOrUsername: newUserId.trim(),
      region: newRegion,
      regionHindi: regionObj?.nameHindi || newRegion,
      password: newPassword,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'उपयोक्ता निर्माण विफल।');
      return;
    }

    const createdInfo = {
      name: newOfficerName.trim(),
      regionHindi: regionObj?.nameHindi || newRegion,
      userId: newUserId.trim(),
      password: newPassword,
      designation: newDesignation.trim(),
    };

    setCreatedUserNotice(createdInfo);
    setSuccessMessage(
      `सफलता! क्षेत्र '${regionObj?.nameHindi || newRegion}' का उपयोक्ता खाता बन गया है और क्रेडेंशियल सुरक्षित रूप से दर्ज कर दिया गया है।`
    );

    // Prepare login tab with created credentials
    setUserSelectedRegion(newRegion);
    setUserIdInput(newUserId.trim());
    setUserPasswordInput(newPassword);
  };

  // 4. Handle Google Sign-in for Admin
  const handleGoogleSignIn = async () => {
    clearMessages();
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        onLoginSuccess(res.user, res.accessToken);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('गूगल लॉगिन विफल रहा। कृपया आईडी/पासवर्ड से लॉगिन करें।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCredentials = () => {
    const allRegistered = getRegisteredUsers();
    downloadPasswordSheet(allRegistered);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 relative z-10">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-900/20 overflow-hidden">
        
        {/* Institutional Branding Header */}
        <div className="bg-gradient-to-r from-red-800 via-red-900 to-amber-950 p-5 sm:p-6 text-white text-center relative border-b-4 border-amber-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-semibold mb-2">
            <span>सेन्ट्रल बैंक ऑफ़ इण्डिया • Central Bank of India</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            राजभाषा विभाग
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-200 tracking-wide mt-0.5">
            आंचलिक कार्यालय, मौर्या लोक, पटना
          </p>
          <p className="text-xs text-white/80 mt-1 max-w-md mx-auto">
            राजभाषा एकीकृत पोर्टल • प्रतिवेदन अपलोड एवं क्षेत्रीय समन्वय मंच
          </p>
        </div>

        {/* 3 Segmented Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('user_login');
              clearMessages();
            }}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'user_login'
                ? 'bg-white text-blue-900 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserIcon className="w-4 h-4 text-blue-600" />
            <span>उपयोक्ता लॉगिन</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin_login');
              clearMessages();
            }}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin_login'
                ? 'bg-white text-red-900 shadow-xs border border-red-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>प्रशासक लॉगिन</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('create_user');
              clearMessages();
            }}
            className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activeTab === 'create_user'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>नया उपयोक्ता बनाएं</span>
          </button>
        </div>

        {/* Feedback Messages */}
        <div className="px-6 pt-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span>{errorMessage}</span>
                {errorMessage.includes('पंजीकरण करें') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('create_user');
                      setNewRegion(userSelectedRegion);
                      clearMessages();
                    }}
                    className="block mt-1 font-bold text-red-900 underline hover:text-red-700"
                  >
                    यहाँ क्लिक करके तुरंत नया पासवर्ड बनाएं &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900 animate-in fade-in">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{successMessage}</span>
              </div>

              {createdUserNotice && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 text-[11px] space-y-1">
                  <div className="font-bold text-slate-800">पंजीकृत खाता विवरण:</div>
                  <div className="grid grid-cols-2 gap-1 text-slate-600">
                    <div>क्षेत्र: <strong>{createdUserNotice.regionHindi}</strong></div>
                    <div>अधिकारी: <strong>{createdUserNotice.name}</strong></div>
                    <div>आईडी: <strong>{createdUserNotice.userId}</strong></div>
                    <div>पासवर्ड: <strong>{createdUserNotice.password}</strong></div>
                  </div>
                  
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-emerald-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('user_login');
                        clearMessages();
                      }}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>सुरक्षित लॉगिन करें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-emerald-800 font-medium">
                      ✓ क्रेडेंशियल आधिकारिक व्यवस्थापक को प्रेषित
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6">
          
          {/* ================= 1. USER LOGIN ================= */}
          {activeTab === 'user_login' && (
            <form onSubmit={handleUserLoginSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">क्षेत्रीय कार्यालय / शाखा उपयोक्ता लॉगिन</span>
                  <span className="text-slate-600">
                    अपना क्षेत्र चुनें और पंजीकरण के समय बनाया गया पासवर्ड दर्ज करें।
                  </span>
                </div>
              </div>

              {/* Dynamic Region Dropdown (Patna, Muzaffarpur, Darbhanga, Gaya, Katihar, Purnia, Siwan, Ranchi, Dhanbad, Motihari) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  अपना क्षेत्र चुनें (Select Your Region): *
                </label>
                <div className="relative">
                  <select
                    value={userSelectedRegion}
                    onChange={(e) => handleRegionChangeInLogin(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
                  >
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.nameHindi} - {reg.officeType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* User ID / Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  उपयोक्ता आईडी / ईमेल (User ID or Email):
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="उदा. patna@cbi.co.in अथवा उपयोक्ता नाम"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* Password Input (Created by user) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    आपका पासवर्ड (Your Password): *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('create_user');
                      setNewRegion(userSelectedRegion);
                      clearMessages();
                    }}
                    className="text-[11px] text-blue-700 hover:underline font-semibold"
                  >
                    पासवर्ड नहीं बनाया? नया बनाएं
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    required
                    value={userPasswordInput}
                    onChange={(e) => setUserPasswordInput(e.target.value)}
                    placeholder="पंजीकरण के समय बनाया गया पासवर्ड दर्ज करें"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>सत्यापित हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <span>पोर्टल में प्रवेश करें (Login)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link to Register */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  पहली बार उपयोग कर रहे हैं?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('create_user');
                      setNewRegion(userSelectedRegion);
                      clearMessages();
                    }}
                    className="font-bold text-emerald-700 hover:text-emerald-800 underline ml-1"
                  >
                    यहाँ नया उपयोक्ता बनाएं एवं पासवर्ड सेट करें
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ================= 2. ADMIN LOGIN ================= */}
          {activeTab === 'admin_login' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">मुख्य प्रशासक (Administrator Gateway)</span>
                  <span>केंद्रीय प्रशासनिक नियंत्रण कक्ष • आंचलिक कार्यालय पटना</span>
                </div>
              </div>

              {/* Admin ID */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  प्रशासक ईमेल / आईडी (Admin ID):
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminIdInput}
                    onChange={(e) => setAdminIdInput(e.target.value)}
                    placeholder="admin@rajbhasha.in या abhijaycbi@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 bg-white"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    प्रशासक पासवर्ड (Admin Password):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdminSecretHint(!showAdminSecretHint)}
                    className="text-[11px] text-amber-700 hover:underline font-semibold"
                  >
                    {showAdminSecretHint ? 'संकेत छिपाएं' : 'संकेत देखें (Hint)'}
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="प्रशासक सुरक्षा पासवर्ड दर्ज करें"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {showAdminSecretHint && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                    डिफ़ॉल्ट एडमिन क्रेडेंशियल: <strong>admin@rajbhasha.in</strong> / पासवर्ड: <strong className="font-mono text-red-800">CBI@123</strong>
                  </div>
                )}
              </div>

              {/* Submit Admin Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-800 to-amber-900 hover:from-red-900 hover:to-amber-950 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>प्रशासक के रूप में लॉगिन करें</span>
              </button>
            </form>
          )}

          {/* ================= 3. CREATE NEW USER (REGISTRATION & GOOGLE SHEET SAVE) ================= */}
          {activeTab === 'create_user' && (
            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
              
              {/* Google Sheet Storage Notice */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">सुरक्षित खाता रजिस्ट्री</span>
                  <span className="text-slate-600">
                    आपका बनाया गया खाता सुरक्षित केंद्रीय डेटाबेस में सहेज लिया जाएगा।
                  </span>
                </div>
              </div>

              {/* Region Dropdown (Patna, Muzaffarpur, Darbhanga, Gaya, Katihar, Purnia, Siwan, Ranchi, Dhanbad, Motihari) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. अपना क्षेत्र चुनें (Select Region): *
                </label>
                <select
                  value={newRegion}
                  onChange={(e) => {
                    setNewRegion(e.target.value);
                    if (!newUserId) {
                      setNewUserId(`${e.target.value}@cbi.co.in`);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-600"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.nameHindi} - {reg.officeType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. अधिकारी का नाम (Officer Name): *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOfficerName}
                    onChange={(e) => setNewOfficerName(e.target.value)}
                    placeholder="उदा. अमित कुमार"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. पदनाम (Designation):
                  </label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="राजभाषा अधिकारी / प्रबंधक"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* User ID / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. उपयोक्ता आईडी / ईमेल (User ID or Email): *
                </label>
                <input
                  type="text"
                  required
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="उदा. muzaffarpur@cbi.co.in अथवा यूजरनेम"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Create Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    5. पासवर्ड बनाएं (Create Password): *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="नया पासवर्ड दर्ज करें"
                      className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    6. पासवर्ड की पुष्टि (Confirm): *
                  </label>
                  <input
                    type="password"
                    required
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड पुनः दर्ज करें"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>खाता बनाएं एवं पासवर्ड सहेजें (Save to Sheet)</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('user_login');
                    clearMessages();
                  }}
                  className="text-xs text-blue-700 font-bold hover:underline"
                >
                  &larr; पहले से खाता बना है? लॉगिन करें
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Institutional Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <span>सुरक्षित राजभाषा प्रणाली</span>
          <span>•</span>
          <span>सेन्ट्रल बैंक ऑफ़ इण्डिया, आंचलिक कार्यालय पटना</span>
        </div>
      </div>
    </div>
  );
};
