import React, { useState } from 'react';
import { AuthUser } from '../types';
import { loginWithCredentials, signInWithGoogle } from '../services/firebaseAuth';
import { getStoredRegions } from '../services/regionService';
import { ShieldCheck, User as UserIcon, Lock, Mail, X, Check, AlertCircle, Building2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, token?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const regions = getStoredRegions();
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [selectedRegion, setSelectedRegion] = useState(regions[0]?.id || 'patna');
  const [emailOrId, setEmailOrId] = useState('admin@rajbhasha.in');
  const [password, setPassword] = useState('Admin@Patna#CBI800');
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = activeTab === 'admin' ? emailOrId.trim() : (emailOrId.trim() || selectedRegion);
    const user = loginWithCredentials(identifier, password);
    if (user) {
      onLoginSuccess(user);
      onClose();
    } else {
      setError(
        activeTab === 'admin'
          ? 'अमान्य प्रशासक क्रेडेंशियल। कृपया सही पासवर्ड दर्ज करें।'
          : 'अमान्य क्षेत्र उपयोक्ता आईडी या पासवर्ड। कृपया पंजीकृत पासवर्ड दर्ज करें।'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        onLoginSuccess(res.user, res.accessToken);
        onClose();
      }
    } catch (err: unknown) {
      const isCancellation = 
        (err as any)?.code === 'auth/popup-closed-by-user' ||
        (err as any)?.code === 'auth/cancelled-popup-request' ||
        (err instanceof Error && err.message.includes('popup-closed-by-user'));

      if (!isCancellation) {
        const errorMsg = err instanceof Error ? err.message : 'Google Login error';
        console.warn('Google sign in notice:', err);
        setError(`गूगल लॉगिन विफल: ${errorMsg}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-700 to-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">राजभाषा पोर्टल लॉगिन</h2>
              <p className="text-xs text-amber-100">आंचलिक कार्यालय पटना • सेन्ट्रल बैंक ऑफ़ इण्डिया</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें (Close)"
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setEmailOrId('admin@rajbhasha.in');
              setPassword('Admin@Patna#CBI800');
              setError(null);
            }}
            className={`py-2 text-center rounded-lg transition-all ${
              activeTab === 'admin' ? 'bg-white text-red-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            प्रशासक लॉगिन (Admin)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('user');
              setEmailOrId('');
              setPassword('');
              setError(null);
            }}
            className={`py-2 text-center rounded-lg transition-all ${
              activeTab === 'user' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            क्षेत्रीय उपयोक्ता (User)
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {activeTab === 'user' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  क्षेत्र चुनें (Select Region):
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    {regions.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.nameHindi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeTab === 'admin' ? 'प्रशासक ईमेल / आईडी:' : 'उपयोक्ता आईडी / ईमेल:'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin@rajbhasha.in' : 'यूजरनेम या ईमेल'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पासवर्ड (Password):
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड दर्ज करें"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              लॉगिन करें (Sign In)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
