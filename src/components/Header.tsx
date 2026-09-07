import React from 'react';
import { AuthUser } from '../types';
import { 
  Cloud, 
  Upload, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Image as ImageIcon,
  CheckCircle2,
  FolderLock,
  SlidersHorizontal,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onOpenBackgrounds: () => void;
  onOpenDriveManager: () => void;
  onOpenTabManager?: () => void;
  onOpenRegionManager?: () => void;
  isDriveConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenUpload,
  onOpenBackgrounds,
  onOpenDriveManager,
  onOpenTabManager,
  onOpenRegionManager,
  isDriveConnected,
}) => {
  return (
    <header className="w-full pt-4 pb-3 px-4 sm:px-6">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-900/10 text-xs">
        {/* Portal & Cloud Status Tag (No personal email or drive trace shown) */}
        <div className="flex items-center gap-2">
          <div 
            id="portal-status-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
            <span>केंद्रीय राजभाषा पोर्टल • आंचलिक कार्यालय पटना</span>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              id="admin-cloud-mgr-badge"
              onClick={onOpenDriveManager}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/80 hover:bg-emerald-100 transition-colors shadow-2xs font-medium cursor-pointer"
              title="प्रशासक क्लाउड स्टोरेज प्रबंधन"
            >
              <Cloud className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
              <span>क्लाउड स्टोरेज प्रबंधन (प्रशासक)</span>
            </button>
          )}
        </div>

        {/* User / Admin Controls */}
        <div className="flex items-center gap-2">
          {/* Report Upload Button (User can upload report, admin can upload report) */}
          {currentUser && (
            <button
              id="header-upload-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white font-medium shadow-xs transition-transform active:scale-95 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>प्रतिवेदन अपलोड करें (Upload Report)</span>
            </button>
          )}

          {/* Admin-Only Controls: Tab Manager, Region Manager, Backgrounds, Drive Manager */}
          {currentUser?.role === 'admin' && (
            <>
              <button
                id="header-tab-mgr-btn"
                onClick={onOpenTabManager}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border border-amber-600 text-xs shadow-xs transition-colors"
                title="टैब का स्थान बदलें (Swap), आकार बदलें (Resize) एवं दृश्यता प्रबंधित करें"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">टैब व लेआउट</span>
              </button>

              <button
                id="header-region-mgr-btn"
                onClick={onOpenRegionManager}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold border border-emerald-300 text-xs shadow-xs transition-colors"
                title="क्षेत्र जोड़ें/हटाएं एवं पासवर्ड स्प्रेडशीट देखें"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">क्षेत्र प्रबंधन</span>
              </button>

              <button
                id="header-admin-bg-btn"
                onClick={onOpenBackgrounds}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium border border-amber-300 text-xs transition-colors"
                title="4-5 गतिशील पृष्ठभूमि छवियां प्रबंधित करें"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden sm:inline">पृष्ठभूमि बदलें</span>
              </button>

              {/* Drive Files Manager */}
              <button
                id="header-drive-mgr-btn"
                onClick={onOpenDriveManager}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs transition-colors"
              >
                <FolderLock className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">ड्राइव फाइलें</span>
              </button>
            </>
          )}

          {/* Auth State Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
              <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 rounded-full px-2.5 py-1 shadow-2xs">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                )}
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-800 text-[11px] leading-tight flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.regionHindi && (
                      <span className="text-[9px] font-bold px-1 rounded bg-blue-100 text-blue-800">
                        {currentUser.regionHindi}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize leading-tight">
                    {currentUser.role === 'admin' ? 'प्रशासक (Admin)' : 'क्षेत्रीय उपयोक्ता (User)'}
                  </span>
                </div>
              </div>
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="p-1.5 rounded-md hover:bg-red-50 text-red-600 border border-red-200 transition-colors"
                title="लॉगआउट (Sign out)"
                aria-label="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>लॉगिन (Admin / User)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Official Title & Emblem Header matching the attached screenshot */}
      <div className="max-w-5xl mx-auto text-center my-3 sm:my-5 relative">
        {/* Central Bank of India Emblem left/right watermark for authentic institutional elegance */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            {/* Primary Hindi Heading: राजभाषा विभाग */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-wide text-[#b91c1c] drop-shadow-xs"
              style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}
            >
              राजभाषा विभाग
            </h1>

            {/* Subtitle: आंचलिक कार्यालय, पटना with blue underline matching the template exactly */}
            <div className="relative inline-block mt-1 sm:mt-1.5">
              <h2 
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-normal text-[#0369a1]"
                style={{ fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}
              >
                आंचलिक कार्यालय, पटना
              </h2>
              {/* Distinctive double line underline from official Indian banking portal styling */}
              <div className="h-0.75 w-full bg-[#0369a1] rounded-full mt-0.5" />
            </div>

            <p className="text-[12px] text-slate-600 font-medium mt-1">
              सेन्ट्रल बैंक ऑफ़ इण्डिया / Central Bank of India • संघ की राजभाषा नीति का प्रभावी अनुपालन
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
