import React, { useState, useEffect } from 'react';
import { AuthUser, BackgroundImage, UploadedReport, ActiveModalType, TabVisibilityConfig, TabKey, TabSizeConfig } from './types';
import { 
  DEFAULT_BACKGROUND_IMAGES, 
  INITIAL_REPORTS, 
  DEFAULT_TAB_VISIBILITY,
  DEFAULT_TAB_ORDER,
  DEFAULT_TAB_SIZES
} from './data/defaultData';
import { BackgroundCarousel } from './components/BackgroundCarousel';
import { Header } from './components/Header';
import { TemplateGrid } from './components/TemplateGrid';
import { InitialAuthScreen } from './components/InitialAuthScreen';
import { LoginModal } from './components/LoginModal';
import { UploadModal } from './components/UploadModal';
import { AdminBackgroundManager } from './components/AdminBackgroundManager';
import { AdminTabManagerModal } from './components/AdminTabManagerModal';
import { AdminRegionManagerModal } from './components/AdminRegionManagerModal';
import { DriveFilesManager } from './components/DriveFilesManager';
import { DetailModal } from './components/DetailModal';
import { initAuth, signOutGoogle, setAccessToken } from './services/firebaseAuth';
import { CheckCircle2, SlidersHorizontal, LogOut, ArrowLeft } from 'lucide-react';

export default function App() {
  // Current user state (starts null to show the InitialAuthScreen first, or loads persisted session)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('rajbhasha_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Tab visibility state (Admin controlled)
  const [tabConfig, setTabConfig] = useState<TabVisibilityConfig>(() => {
    const saved = localStorage.getItem('rajbhasha_tab_visibility');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...DEFAULT_TAB_VISIBILITY, ...parsed };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_TAB_VISIBILITY;
  });

  // Tab order state (Swap positions by Admin)
  const [tabOrder, setTabOrder] = useState<TabKey[]>(() => {
    const saved = localStorage.getItem('rajbhasha_tab_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validKeys = DEFAULT_TAB_ORDER.filter((k) => parsed.includes(k));
          const missingKeys = DEFAULT_TAB_ORDER.filter((k) => !parsed.includes(k));
          return [...validKeys, ...missingKeys];
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_TAB_ORDER;
  });

  // Tab sizes state (Resize cards: compact, normal, wide, large by Admin)
  const [tabSizes, setTabSizes] = useState<TabSizeConfig>(() => {
    const saved = localStorage.getItem('rajbhasha_tab_sizes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...DEFAULT_TAB_SIZES, ...parsed };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_TAB_SIZES;
  });

  // Tab backgrounds state (Per-card background color/theme managed by admin)
  const [tabBackgrounds, setTabBackgrounds] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('rajbhasha_tab_backgrounds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {
        // fallback
      }
    }
    return {};
  });

  // Background images state (4 to 5 dynamic images, managed by admin)
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImage[]>(() => {
    const saved = localStorage.getItem('rajbhasha_backgrounds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_BACKGROUND_IMAGES;
  });

  // Uploaded reports repository
  const [reports, setReports] = useState<UploadedReport[]>(() => {
    const saved = localStorage.getItem('rajbhasha_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_REPORTS;
  });

  // Modal states
  const [activeDetailModal, setActiveDetailModal] = useState<ActiveModalType>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdminBgOpen, setIsAdminBgOpen] = useState(false);
  const [isAdminRegionOpen, setIsAdminRegionOpen] = useState(false);
  const [isTabManagerOpen, setIsTabManagerOpen] = useState(false);
  const [isDriveManagerOpen, setIsDriveManagerOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    showToast('प्रतिवेदन हटा दिया गया है।');
  };

  // Persist tab visibility configuration
  useEffect(() => {
    localStorage.setItem('rajbhasha_tab_visibility', JSON.stringify(tabConfig));
  }, [tabConfig]);

  // Persist tab order (swap sequence)
  useEffect(() => {
    localStorage.setItem('rajbhasha_tab_order', JSON.stringify(tabOrder));
  }, [tabOrder]);

  // Persist tab card sizes
  useEffect(() => {
    localStorage.setItem('rajbhasha_tab_sizes', JSON.stringify(tabSizes));
  }, [tabSizes]);

  const handleResetLayout = () => {
    setTabOrder(DEFAULT_TAB_ORDER);
    setTabSizes(DEFAULT_TAB_SIZES);
    showToast('टैब क्रम एवं आकार मूल स्थिति पर रीसेट कर दिए गए हैं।');
  };

  // Persist background images whenever modified by admin
  useEffect(() => {
    localStorage.setItem('rajbhasha_backgrounds', JSON.stringify(backgroundImages));
  }, [backgroundImages]);

  // Persist reports
  useEffect(() => {
    localStorage.setItem('rajbhasha_reports', JSON.stringify(reports));
  }, [reports]);

  // Persist current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rajbhasha_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rajbhasha_user');
    }
  }, [currentUser]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleAccessToken(token);
        setAccessToken(token);
        showToast('क्लाउड स्टोरेज से सफलतापूर्वक कनेक्ट हो गया है!');
      },
      () => {
        // failure / logged out of Google
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleLoginSuccess = (user: AuthUser, token?: string) => {
    setCurrentUser(user);
    if (token) {
      setGoogleAccessToken(token);
      setAccessToken(token);
    }
    setIsLoginOpen(false);
    showToast(
      user.role === 'admin'
        ? `प्रशासक (Admin) के रूप में सफलतापूर्वक लॉगिन किया गया। सभी नियंत्रण सक्षम हैं।`
        : `${user.regionHindi || 'उपयोक्ता'} (${user.displayName || user.name}) के रूप में लॉगिन किया गया।`
    );
  };

  const handleLogout = async () => {
    await signOutGoogle();
    setGoogleAccessToken(null);
    setAccessToken(null);
    setCurrentUser(null);
    showToast('सफलतापूर्वक लॉगआउट किया गया।');
  };

  const handleUploadSuccess = (newReport: UploadedReport) => {
    setReports((prev) => [newReport, ...prev]);
    showToast('प्रतिवेदन सफलतापूर्वक सुरक्षित केंद्रीय सर्वर पर सहेज दिया गया!');
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-800 selection:bg-red-100 selection:text-red-900">
      {/* Dynamic changing 4 to 5 background images with gentle crossfade */}
      <BackgroundCarousel
        images={backgroundImages}
        onOpenAdminManager={() => setIsAdminBgOpen(true)}
        isAdmin={currentUser?.role === 'admin'}
      />

      {/* If not logged in, render the InitialAuthScreen prominently */}
      {!currentUser ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 min-h-screen">
          <InitialAuthScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        /* Main application interface when user is logged in */
        <>
          {/* Official Header */}
          <Header
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
            onLogout={handleLogout}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenBackgrounds={() => setIsAdminBgOpen(true)}
            onOpenDriveManager={() => setIsDriveManagerOpen(true)}
            onOpenTabManager={() => setIsTabManagerOpen(true)}
            onOpenRegionManager={() => setIsAdminRegionOpen(true)}
            isDriveConnected={!!googleAccessToken}
          />

          {/* Main Content: Template Grid (Clean, Attractive & Simple Front Page) */}
          <main className="flex-1 w-full pb-8 max-w-7xl mx-auto px-3 sm:px-6">
            {/* Attached Template Grid with 4x4 layout, top scrolling thought, Swap & Resize capabilities */}
            <TemplateGrid
              tabConfig={tabConfig}
              onToggleTabVisibility={(key) => {
                setTabConfig((prev) => {
                  const updated = { ...prev, [key]: !prev[key] };
                  localStorage.setItem('rajbhasha_tab_visibility', JSON.stringify(updated));
                  showToast(updated[key] ? 'टैब अब प्रदर्शित होगा।' : 'टैब उपयोक्ताओं से छिपा दिया गया है।');
                  return updated;
                });
              }}
              currentUser={currentUser}
              tabOrder={tabOrder}
              onUpdateTabOrder={(newOrder) => {
                setTabOrder(newOrder);
                showToast('टैब स्थान (क्रम) सफलतापूर्वक बदल दिया गया।');
              }}
              tabSizes={tabSizes}
              onUpdateTabSizes={(newSizes) => {
                setTabSizes(newSizes);
                showToast('टैब का आकार अपडेट कर दिया गया।');
              }}
              tabBackgrounds={tabBackgrounds}
              onUpdateTabBackgrounds={(newBgs) => {
                setTabBackgrounds(newBgs);
                localStorage.setItem('rajbhasha_tab_backgrounds', JSON.stringify(newBgs));
                showToast('कार्ड पृष्ठभूमि रंग अद्यतन कर दिया गया।');
              }}
              onResetLayout={handleResetLayout}
              onSelectModal={(modal) => setActiveDetailModal(modal)}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenTabManager={() => setIsTabManagerOpen(true)}
              onOpenBackgroundManager={() => setIsAdminBgOpen(true)}
              onOpenDriveManager={() => setIsDriveManagerOpen(true)}
            />
          </main>

          {/* Official Institutional Footer */}
          <footer className="w-full bg-slate-900/90 text-slate-300 py-3 px-4 border-t border-slate-700/50 text-xs backdrop-blur-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">राजभाषा विभाग</span>
                <span>• आंचलिक कार्यालय पटना (Zonal Office Patna)</span>
                <span className="hidden md:inline">• सेन्ट्रल बैंक ऑफ़ इण्डिया</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>सुरक्षित केंद्रीय रिपॉजिटरी</span>
                <span>•</span>
                {currentUser?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setIsAdminRegionOpen(true)}
                      className="hover:text-emerald-300 underline transition-colors flex items-center gap-1"
                    >
                      <span>क्षेत्र प्रबंधन (Regions)</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setIsAdminBgOpen(true)}
                      className="hover:text-amber-300 underline transition-colors flex items-center gap-1"
                    >
                      <span>पृष्ठभूमि बदलें (Background)</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setIsTabManagerOpen(true)}
                      className="hover:text-amber-300 underline transition-colors flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>टैब दृश्यता प्रबंधन</span>
                    </button>
                    <span>•</span>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="hover:text-red-300 text-slate-300 underline transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>खाता बदलें / लॉगआउट</span>
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        googleAccessToken={googleAccessToken}
        onUploadSuccess={handleUploadSuccess}
        onConnectGoogle={() => {
          setIsUploadOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Admin Tab Layout & Visibility Manager Modal */}
      <AdminTabManagerModal
        isOpen={isTabManagerOpen}
        onClose={() => setIsTabManagerOpen(false)}
        tabConfig={tabConfig}
        onUpdateTabConfig={(newConfig) => {
          setTabConfig(newConfig);
          showToast('टैब दृश्यता सेटिंग्स सफलतापूर्वक अपडेट की गईं।');
        }}
        tabOrder={tabOrder}
        onUpdateTabOrder={(newOrder) => {
          setTabOrder(newOrder);
          showToast('टैब क्रम (स्थान) अपडेट किया गया।');
        }}
        tabSizes={tabSizes}
        onUpdateTabSizes={(newSizes) => {
          setTabSizes(newSizes);
          showToast('टैब आकार अपडेट किया गया।');
        }}
        onResetLayout={handleResetLayout}
      />

      {/* Admin Region Manager Modal */}
      <AdminRegionManagerModal
        isOpen={isAdminRegionOpen}
        onClose={() => setIsAdminRegionOpen(false)}
        onRegionsUpdated={() => {
          showToast('क्षेत्र सूची सफलतापूर्वक अपडेट की गई।');
        }}
      />

      <AdminBackgroundManager
        isOpen={isAdminBgOpen}
        onClose={() => setIsAdminBgOpen(false)}
        currentUser={currentUser}
        backgroundImages={backgroundImages}
        onUpdateImages={(imgs) => {
          setBackgroundImages(imgs);
          showToast('पृष्ठभूमि छवियां सफलतापूर्वक अपडेट की गईं।');
        }}
        onOpenLogin={() => {
          setIsAdminBgOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <DriveFilesManager
        isOpen={isDriveManagerOpen}
        onClose={() => setIsDriveManagerOpen(false)}
        reports={reports}
        currentUser={currentUser}
        onOpenUpload={() => {
          setIsDriveManagerOpen(false);
          setIsUploadOpen(true);
        }}
        isDriveConnected={!!googleAccessToken}
        onConnectGoogle={() => {
          setIsDriveManagerOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <DetailModal
        modalType={activeDetailModal}
        onClose={() => setActiveDetailModal(null)}
        onOpenUpload={() => {
          setActiveDetailModal(null);
          setIsUploadOpen(true);
        }}
        reports={reports}
        currentUser={currentUser}
        googleAccessToken={googleAccessToken}
        onUploadSuccess={handleUploadSuccess}
        onDeleteReport={handleDeleteReport}
      />
    </div>
  );
}
