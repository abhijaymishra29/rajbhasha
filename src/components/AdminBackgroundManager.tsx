import React, { useState, useRef } from 'react';
import { BackgroundImage, AuthUser } from '../types';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { DEFAULT_BACKGROUND_IMAGES } from '../data/defaultData';

interface AdminBackgroundManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  backgroundImages: BackgroundImage[];
  onUpdateImages: (images: BackgroundImage[]) => void;
  onOpenLogin: () => void;
}

export const AdminBackgroundManager: React.FC<AdminBackgroundManagerProps> = ({
  isOpen,
  onClose,
  currentUser,
  backgroundImages,
  onUpdateImages,
  onOpenLogin,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('कृपया केवल मान्य छवि फ़ाइल (JPG, PNG, WebP) का चयन करें।');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewDataUrl(result);
        setNewUrl(result);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('छवि जोड़ने के लिए प्रशासक (Admin) अधिकार आवश्यक हैं।');
      return;
    }

    const imageSource = previewDataUrl || newUrl.trim();
    if (!imageSource) {
      setError('कृपया एक छवि फ़ाइल अपलोड करें अथवा वैध छवि URL दर्ज करें।');
      return;
    }

    const newImg: BackgroundImage = {
      id: 'bg-' + Date.now(),
      url: imageSource,
      title: newTitle.trim() || 'नई पृष्ठभूमि छवि (Patna Heritage)',
      caption: newCaption.trim() || 'प्रशासक द्वारा जोड़ी गई छवि',
      addedBy: currentUser?.name || 'Admin',
      addedAt: new Date().toISOString().split('T')[0],
      isDefault: false,
    };

    const updated = [...backgroundImages, newImg];
    onUpdateImages(updated);
    setSuccess('नई पृष्ठभूमि छवि सफलतापूर्वक जोड़ी गई!');
    setNewTitle('');
    setNewCaption('');
    setNewUrl('');
    setPreviewDataUrl(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteImage = (id: string) => {
    if (!isAdmin) {
      setError('छवि हटाने के लिए प्रशासक अधिकार आवश्यक हैं।');
      return;
    }
    if (backgroundImages.length <= 1) {
      setError('कम से कम एक पृष्ठभूमि छवि होना आवश्यक है।');
      return;
    }
    const updated = backgroundImages.filter((img) => img.id !== id);
    onUpdateImages(updated);
  };

  const handleResetDefaults = () => {
    if (!isAdmin) return;
    onUpdateImages(DEFAULT_BACKGROUND_IMAGES);
    setSuccess('डिफ़ॉल्ट 5 आधिकारिक पृष्ठभूमियों को पुनर्स्थापित कर दिया गया है।');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-red-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">पृष्ठभूमि छवि प्रबंधन (Admin Image Manager)</h2>
              <p className="text-xs text-amber-100">
                4-5 गतिशील पृष्ठभूमि छवियां अपलोड एवं प्रबंधित करें
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

        {/* Admin Check Warning Banner if not logged in as Admin */}
        {!isAdmin && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                पृष्ठभूमि छवियां अपलोड करने के लिए <strong>प्रशासक (Admin)</strong> के रूप में लॉगिन करें।
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              प्रशासक लॉगिन करें (Admin Login)
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Current Carousel Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>वर्तमान सक्रिय पृष्ठभूमियां ({backgroundImages.length})</span>
                <span className="text-xs font-normal text-slate-500">• स्वचालित 6 सेकंड पर बदलती हैं</span>
              </h3>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>डिफ़ॉल्ट 5 रीसेट करें</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {backgroundImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-xs"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2 text-white">
                    <div className="flex justify-between items-start">
                      <span className="bg-black/50 text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        #{idx + 1}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1 rounded bg-red-600/80 hover:bg-red-700 text-white transition-colors"
                          title="हटाएं"
                          aria-label={`छवि ${idx + 1} हटाएं`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate leading-tight">{img.title}</p>
                      <p className="text-[10px] text-slate-300 truncate">{img.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Background Form (Active for Admin) */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-red-700" />
                <span>नई पृष्ठभूमि छवि जोड़ें / अपलोड करें (Upload New Image)</span>
              </h3>

              <form onSubmit={handleAddImage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      छवि का शीर्षक (Title in Hindi / English): *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="उदा. गोलघर पटना, गंगा आरती"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      विवरण / उपशीर्षक (Caption):
                    </label>
                    <input
                      type="text"
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      placeholder="उदा. आंचलिक कार्यालय पटना परिक्षेत्र"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* File Upload OR URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      विकल्प 1: अपने कंप्यूटर से अपलोड करें:
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 border border-dashed border-amber-600 bg-amber-50/50 hover:bg-amber-100/60 rounded-lg text-xs font-semibold text-amber-900 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-amber-700" />
                      <span>{previewDataUrl ? 'छवि बदलें' : 'छवि फ़ाइल चुनें'}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      विकल्प 2: वेब छवि लिंक (Image URL):
                    </span>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => {
                          setNewUrl(e.target.value);
                          setPreviewDataUrl(null);
                        }}
                        placeholder="https://example.com/patna.jpg"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview if file or URL chosen */}
                {(previewDataUrl || newUrl) && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                    <img
                      src={previewDataUrl || newUrl}
                      alt="Preview"
                      className="w-20 h-14 object-cover rounded-lg border border-slate-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">पूर्वावलोकन (Preview)</p>
                      <p className="text-slate-500">
                        यह छवि गतिशील पृष्ठभूमि चक्रव्यूह (Carousel) में स्वतः सम्मिलित हो जाएगी।
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    id="add-bg-submit-btn"
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>पृष्ठभूमि सूची में जोड़ें (Save Background)</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
