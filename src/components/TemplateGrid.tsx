import React, { useState } from 'react';
import { ActiveModalType, AuthUser, TabVisibilityConfig, TabKey, TabSizeConfig, TabCardSize } from '../types';
import { 
  Home, 
  FileText, 
  BookOpen, 
  Users, 
  Globe2, 
  GraduationCap, 
  Building2, 
  FileCheck2, 
  Feather, 
  Languages, 
  Coins, 
  Sun,
  Award,
  UploadCloud,
  Eye,
  EyeOff,
  SlidersHorizontal,
  FolderLock,
  Image as ImageIcon,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Maximize2,
  Columns,
  RotateCcw,
  Sparkles,
  Check,
  LayoutGrid,
  GripVertical,
  Move,
  CornerDownRight,
  Hand,
  X,
  Volume2,
  Palette,
  Settings2,
  TableProperties
} from 'lucide-react';
import { THOUGHT_OF_THE_DAY } from '../data/defaultData';
import { TAB_META_MAP, TAB_ITEMS } from './AdminTabManagerModal';

export const TAB_COLOR_PRESETS: { id: string; label: string; bgClass: string; borderClass: string; textClass?: string }[] = [
  { id: 'default', label: 'डिफ़ॉल्ट श्वेत (Classic White)', bgClass: 'bg-white/95', borderClass: 'border-slate-300' },
  { id: 'royal_red', label: 'सेंट्रल बैंक लाल (CBI Crimson)', bgClass: 'bg-gradient-to-br from-red-50 to-rose-100/90', borderClass: 'border-red-400', textClass: 'text-red-950' },
  { id: 'warm_amber', label: 'स्वर्ण / अंबर (Amber Gold)', bgClass: 'bg-gradient-to-br from-amber-50 to-orange-100/90', borderClass: 'border-amber-400', textClass: 'text-amber-950' },
  { id: 'ocean_blue', label: 'नील / सागरीय (Ocean Blue)', bgClass: 'bg-gradient-to-br from-sky-50 to-blue-100/90', borderClass: 'border-blue-400', textClass: 'text-blue-950' },
  { id: 'emerald', label: 'पन्ना हरा (Emerald Green)', bgClass: 'bg-gradient-to-br from-emerald-50 to-teal-100/90', borderClass: 'border-emerald-400', textClass: 'text-emerald-950' },
  { id: 'lavender', label: 'लैवेंडर (Purple / Violet)', bgClass: 'bg-gradient-to-br from-purple-50 to-violet-100/90', borderClass: 'border-purple-400', textClass: 'text-purple-950' },
];

interface TemplateGridProps {
  onSelectModal: (modal: ActiveModalType) => void;
  onOpenUpload: () => void;
  tabConfig: TabVisibilityConfig;
  onToggleTabVisibility?: (key: TabKey) => void;
  currentUser: AuthUser | null;
  tabOrder: TabKey[];
  onUpdateTabOrder: (newOrder: TabKey[]) => void;
  tabSizes: TabSizeConfig;
  onUpdateTabSizes: (newSizes: TabSizeConfig) => void;
  tabBackgrounds?: Record<string, string>;
  onUpdateTabBackgrounds?: (newBgs: Record<string, string>) => void;
  onResetLayout: () => void;
  onOpenTabManager?: () => void;
  onOpenBackgroundManager?: () => void;
  onOpenDriveManager?: () => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  onSelectModal,
  onOpenUpload,
  tabConfig,
  onToggleTabVisibility,
  currentUser,
  tabOrder,
  onUpdateTabOrder,
  tabSizes,
  onUpdateTabSizes,
  tabBackgrounds = {},
  onUpdateTabBackgrounds,
  onResetLayout,
  onOpenTabManager,
  onOpenBackgroundManager,
  onOpenDriveManager,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [activeSwapDropdown, setActiveSwapDropdown] = useState<TabKey | null>(null);
  const [activeBgPaletteFor, setActiveBgPaletteFor] = useState<TabKey | null>(null);

  // Layout presentation mode: '4x4' row-column grid (default) or 'classic' 3-row layout
  const [gridLayoutMode, setGridLayoutMode] = useState<'4x4' | 'classic'>(() => {
    const saved = localStorage.getItem('rajbhasha_grid_layout_mode');
    return saved === 'classic' ? 'classic' : '4x4';
  });

  const handleSetLayoutMode = (mode: '4x4' | 'classic') => {
    setGridLayoutMode(mode);
    localStorage.setItem('rajbhasha_grid_layout_mode', mode);
    showToast(mode === '4x4' ? '✓ 4x4 रो-कॉलम मैट्रिक्स लेआउट सक्रिय' : '✓ क्लासिक 3-पंक्ति लेआउट सक्रिय');
  };

  // Audio Speech state for Thought of the Day
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Active Thought of the Day
  const [activeThought] = useState(() => {
    try {
      const saved = localStorage.getItem('rajbhasha_custom_thought');
      if (saved) return JSON.parse(saved);
    } catch {}
    return THOUGHT_OF_THE_DAY;
  });

  const handleSpeakThought = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('आपके ब्राउज़र में वाक् संश्लेषण (Speech Synthesis) समर्थित नहीं है।');
      return;
    }
    window.speechSynthesis.cancel();
    if (isPlayingSpeech) {
      setIsPlayingSpeech(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.88;
    utterance.onstart = () => setIsPlayingSpeech(true);
    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);
    window.speechSynthesis.speak(utterance);
  };

  // Drag and drop states
  const [draggedKey, setDraggedKey] = useState<TabKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<TabKey | null>(null);

  // 2-Tap swap state (effortless for mobile/touch or simple clicks)
  const [tapSwapKey, setTapSwapKey] = useState<TabKey | null>(null);

  // Pointer drag resizing state (corner handle)
  const [resizingState, setResizingState] = useState<{
    key: TabKey;
    startX: number;
    startY: number;
    initialSize: TabCardSize;
    previewSize: TabCardSize;
  } | null>(null);

  // Floating feedback toast
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => {
      setToastFeedback((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Per-tab background color changer
  const handleSetTabColor = (key: TabKey, colorPresetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...tabBackgrounds, [key]: colorPresetId };
    if (onUpdateTabBackgrounds) {
      onUpdateTabBackgrounds(updated);
    } else {
      localStorage.setItem('rajbhasha_tab_backgrounds', JSON.stringify(updated));
    }
    const preset = TAB_COLOR_PRESETS.find(p => p.id === colorPresetId);
    showToast(`✓ कार्ड पृष्ठभूमि रंग: '${preset?.label.split(' ')[0] || colorPresetId}' सेट`);
    setActiveBgPaletteFor(null);
  };

  // Position swap handlers
  const handleShift = (index: number, direction: 'earlier' | 'later', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'earlier' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tabOrder.length) return;

    const newOrder = [...tabOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onUpdateTabOrder(newOrder);
  };

  const handleSwapDirect = (keyA: TabKey, keyB: TabKey, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    if (keyA === keyB) return;
    const indexA = tabOrder.indexOf(keyA);
    const indexB = tabOrder.indexOf(keyB);
    if (indexA === -1 || indexB === -1) return;

    const newOrder = [...tabOrder];
    newOrder[indexA] = keyB;
    newOrder[indexB] = keyA;
    onUpdateTabOrder(newOrder);
    setActiveSwapDropdown(null);
  };

  const handleSetSize = (key: TabKey, size: TabCardSize, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateTabSizes({
      ...tabSizes,
      [key]: size,
    });
  };

  // 1-Click cycle size: Compact -> Normal -> Wide -> Large -> Compact
  const handleCycleSize = (key: TabKey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = tabSizes[key] || 'normal';
    const cycleMap: Record<TabCardSize, TabCardSize> = {
      compact: 'normal',
      normal: 'wide',
      wide: 'large',
      large: 'compact',
    };
    const nextSize = cycleMap[current];
    onUpdateTabSizes({
      ...tabSizes,
      [key]: nextSize,
    });
    const meta = TAB_META_MAP[key];
    const sizeName = nextSize === 'compact' ? 'छोटा' : nextSize === 'normal' ? 'सामान्य' : nextSize === 'wide' ? 'चौड़ा (2-कॉलम)' : 'बड़ा';
    showToast(`✓ ${meta?.hindiTitle || key}: नया आकार '${sizeName}'`);
  };

  // Corner drag-to-resize pointer handler
  const handleResizePointerDown = (
    key: TabKey,
    currentSize: TabCardSize,
    startX: number,
    startY: number
  ) => {
    setResizingState({
      key,
      startX,
      startY,
      initialSize: currentSize,
      previewSize: currentSize,
    });

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;

      let nextPreview: TabCardSize = currentSize;
      if (dx > 45 && dy > 45) {
        nextPreview = 'large';
      } else if (dx > 35) {
        nextPreview = 'wide';
      } else if (dx < -25 || dy < -25) {
        nextPreview = 'compact';
      } else {
        nextPreview = 'normal';
      }

      setResizingState((prev) => (prev ? { ...prev, previewSize: nextPreview } : null));
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);

      setResizingState((curr) => {
        if (curr) {
          onUpdateTabSizes({
            ...tabSizes,
            [curr.key]: curr.previewSize,
          });
          const meta = TAB_META_MAP[curr.key];
          const sizeName = curr.previewSize === 'compact' ? 'छोटा' : curr.previewSize === 'normal' ? 'सामान्य' : curr.previewSize === 'wide' ? 'चौड़ा' : 'बड़ा';
          showToast(`✓ ${meta?.hindiTitle || curr.key}: आकार '${sizeName}' सुरक्षित`);
        }
        return null;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (key: TabKey, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedKey(key);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (targetKey: TabKey) => {
    if (draggedKey && draggedKey !== targetKey) {
      setDragOverKey(targetKey);
    }
  };

  const handleDragLeave = (targetKey: TabKey) => {
    if (dragOverKey === targetKey) {
      setDragOverKey(null);
    }
  };

  const handleDrop = (targetKey: TabKey, e: React.DragEvent) => {
    e.preventDefault();
    const sourceKey = draggedKey || (e.dataTransfer.getData('text/plain') as TabKey);
    if (sourceKey && sourceKey !== targetKey) {
      handleSwapDirect(sourceKey, targetKey);
      const metaA = TAB_META_MAP[sourceKey];
      const metaB = TAB_META_MAP[targetKey];
      showToast(`✓ स्थान बदला गया: ${metaA?.hindiTitle || sourceKey} ⇄ ${metaB?.hindiTitle || targetKey}`);
    }
    setDraggedKey(null);
    setDragOverKey(null);
  };

  const handleDragEnd = () => {
    setDraggedKey(null);
    setDragOverKey(null);
  };

  // 2-Tap Swap for touch screens
  const handleTapSwapSelect = (key: TabKey, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tapSwapKey) {
      setTapSwapKey(key);
      const meta = TAB_META_MAP[key];
      showToast(`👉 '${meta?.hindiTitle || key}' चयनित। अब दूसरे कार्ड पर टैप करें।`);
    } else if (tapSwapKey === key) {
      setTapSwapKey(null);
      showToast('चयन रद्द किया गया');
    } else {
      handleSwapDirect(tapSwapKey, key);
      const metaA = TAB_META_MAP[tapSwapKey];
      const metaB = TAB_META_MAP[key];
      showToast(`✓ स्थान बदला गया: ${metaA?.hindiTitle || tapSwapKey} ⇄ ${metaB?.hindiTitle || key}`);
      setTapSwapKey(null);
    }
  };

  // Set all to a preset size
  const handleSetAllSizes = (newSize: TabCardSize) => {
    const updated = { ...tabSizes } as TabSizeConfig;
    tabOrder.forEach((k) => {
      updated[k] = newSize;
    });
    onUpdateTabSizes(updated);
    const sizeName = newSize === 'compact' ? 'छोटा' : newSize === 'normal' ? 'सामान्य' : 'चौड़ा';
    showToast(`✓ सभी कार्ड का आकार '${sizeName}' किया गया`);
  };

  // Render individual card contents based on tabKey
  const renderCardContent = (key: TabKey, size: TabCardSize) => {
    const isCompact = size === 'compact';
    const isLarge = size === 'large';

    switch (key) {
      case 'home':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-lg sm:text-xl' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              मुख्य पृष्ठ
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              HOME PAGE
            </span>
            <div className={`rounded-full bg-red-50 text-[#b91c1c] group-hover:scale-110 transition-transform ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2 p-1.5'}`}>
              <Home className={`${isCompact ? 'w-4 h-4' : isLarge ? 'w-8 h-8' : 'w-6 h-6 sm:w-7 sm:h-7'} stroke-[1.8]`} />
            </div>
            <span className={`text-slate-500 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>पोर्टल मुख्य द्वार</span>
          </>
        );

      case 'monthly_report':
        return (
          <>
            <h3 className={`font-bold text-[#b91c1c] leading-tight ${isLarge ? 'text-lg sm:text-xl' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              मासिक प्रतिवेदन
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              MONTHLY REPORT
            </span>
            <div className={`rounded bg-amber-100 border border-amber-300 font-bold text-amber-950 ${isCompact ? 'my-1 px-1.5 py-0.2 text-[10px]' : 'my-1.5 px-2.5 py-0.5 text-xs'}`}>
              आर.वी. 1 / R.V. 1
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>मासिक प्रगति रिपोर्ट एवं विवरण</span>
          </>
        );

      case 'quarterly_report':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-lg sm:text-xl' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              तिमाही प्रगति रिपोर्ट
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              Quarterly Progress Report
            </span>
            <div className={`rounded bg-[#b91c1c] text-white font-bold flex items-center gap-1 shadow-2xs ${isCompact ? 'my-1 px-1.5 py-0.2 text-[9px]' : 'my-1.5 px-2 py-0.5 text-[10px]'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span>सेन्ट्रल बैंक ऑफ़ इण्डिया</span>
            </div>
            <span className={`text-slate-500 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>QPR प्रपत्र एवं विश्लेषण</span>
          </>
        );

      case 'emagazine':
        return (
          <>
            <h3 className={`font-bold text-[#b91c1c] leading-tight ${isLarge ? 'text-lg sm:text-xl' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              ई-पत्रिका
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              E-Magazine
            </span>
            <div className={`rounded-full bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2 p-1.5'}`}>
              <BookOpen className={`${isCompact ? 'w-4 h-4' : isLarge ? 'w-8 h-8' : 'w-6 h-6 sm:w-7 sm:h-7'} stroke-[1.8]`} />
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>पाटलिपुत्र सौरभ / रचनाएं</span>
          </>
        );

      case 'olic':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight line-clamp-1 ${isLarge ? 'text-base sm:text-lg' : isCompact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              राजभाषा कार्यान्वयन समिति
            </h3>
            <span className={`font-semibold text-[#0369a1] leading-tight mt-0.5 line-clamp-1 ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>
              Official Language Implementation Committee
            </span>
            <div className={`rounded bg-[#0369a1] text-white font-bold flex items-center gap-1 shadow-2xs ${isCompact ? 'my-1 px-1.5 py-0.2 text-[9px]' : 'my-1.5 px-2 py-0.5 text-[10px]'}`}>
              <Users className="w-3 h-3 text-yellow-300" />
              <span>OLIC / राकास समिति</span>
            </div>
            <span className={`text-slate-500 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>बैठक कार्यवृत्त एवं संकल्प</span>
          </>
        );

      case 'rv_format':
        return (
          <>
            <h3 className={`font-extrabold text-[#b91c1c] leading-tight ${isLarge ? 'text-lg sm:text-2xl' : isCompact ? 'text-xs' : 'text-base sm:text-lg'}`}>
              आर. वी. प्रारूप
            </h3>
            <span className={`font-bold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-xs'}`}>
              R.V. FORMAT
            </span>
            <div className={`rounded-lg bg-red-50 text-red-700 ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2 p-1.5'}`}>
              <FileText className={`${isCompact ? 'w-5 h-5' : isLarge ? 'w-8 h-8' : 'w-7 h-7'}`} />
            </div>
            <p className={`font-semibold text-slate-800 leading-snug px-1 line-clamp-2 ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              क्षेत्रीय कार्यालय में पदस्थ राजभाषा प्रभारी का मासिक प्रतिवेदन
            </p>
          </>
        );

      case 'annual_programme':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-base sm:text-lg' : isCompact ? 'text-xs' : 'text-sm'}`}>
              वार्षिक कार्यक्रम
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              ANNUAL PROGRAMME
            </span>
            <div className={`rounded-full bg-amber-50 text-amber-800 ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2 p-1.5'}`}>
              <Award className={`${isCompact ? 'w-5 h-5' : isLarge ? 'w-7 h-7' : 'w-6 h-6'}`} />
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>गृह मंत्रालय द्वारा निर्धारित लक्ष्य</span>
          </>
        );

      case 'mis_portal':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-base' : isCompact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              सूचना प्रबंधन प्रणाली
            </h3>
            <span className={`font-medium text-[#b91c1c] mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              तिमाही प्रगति रिपोर्ट
            </span>
            <div className={`rounded-md bg-blue-50 text-[#0369a1] ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2 p-1.5'}`}>
              <Globe2 className={`${isCompact ? 'w-5 h-5' : isLarge ? 'w-7 h-7' : 'w-6 h-6'}`} />
            </div>
            <div className={`font-bold text-slate-700 ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              राजभाषा विभाग / गृह मंत्रालय
            </div>
          </>
        );

      case 'hindi_workshop':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-base sm:text-lg' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              हिंदी कार्यशाला
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-xs'}`}>
              HINDI WORKSHOP
            </span>
            <div className={`rounded-full bg-blue-50 text-[#0369a1] group-hover:scale-110 transition-transform ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2.5 p-2'}`}>
              <GraduationCap className={`${isCompact ? 'w-5 h-5' : isLarge ? 'w-8 h-8' : 'w-7 h-7'}`} />
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>त्रैमासिक कार्यशाला एवं प्रशिक्षण</span>
          </>
        );

      case 'tolic':
        return (
          <>
            <h3 className={`font-bold text-[#b91c1c] leading-tight line-clamp-1 ${isLarge ? 'text-sm sm:text-base' : isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
              नगर राजभाषा कार्यान्वयन समिति
            </h3>
            <span className={`font-semibold text-[#0369a1] leading-tight mt-0.5 line-clamp-1 ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>
              TOLIC PATNA
            </span>
            <div className={`rounded-full bg-amber-50 text-amber-900 group-hover:scale-110 transition-transform ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2.5' : 'my-2.5 p-2'}`}>
              <Building2 className={`${isCompact ? 'w-5 h-5' : isLarge ? 'w-8 h-8' : 'w-7 h-7'}`} />
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>नराकास पटना (बैंक) मंच</span>
          </>
        );

      case 'circulars':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-lg' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              परिपत्र
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              CIRCULAR
            </span>
            <div className={`rounded-full bg-purple-50 text-purple-700 group-hover:scale-110 transition-transform ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2' : 'my-1.5 p-1.5'}`}>
              <FileCheck2 className={`${isCompact ? 'w-4 h-4' : isLarge ? 'w-8 h-8' : 'w-6 h-6'} stroke-[1.8]`} />
            </div>
            <span className={`text-slate-600 font-bold ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>राजभाषा विभाग</span>
          </>
        );

      case 'author_of_month':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-base' : isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
              इस माह के चयनित
            </h3>
            <span className={`font-extrabold text-[#b91c1c] tracking-tight mt-0.5 ${isLarge ? 'text-base' : isCompact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              साहित्यकार
            </span>
            <div className={`rounded-full bg-amber-50 text-amber-800 group-hover:scale-110 transition-transform ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2' : 'my-1.5 p-1.5'}`}>
              <Feather className={`${isCompact ? 'w-4 h-4' : isLarge ? 'w-8 h-8' : 'w-6 h-6'} stroke-[1.8]`} />
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>रामधारी सिंह 'दिनकर'</span>
          </>
        );

      case 'admin_glossary':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-base' : isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
              सरल प्रशासनिक
            </h3>
            <span className={`font-extrabold text-[#b91c1c] tracking-tight mt-0.5 ${isLarge ? 'text-base' : isCompact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              शब्दावली
            </span>
            <p className={`text-slate-600 font-medium mt-1 leading-snug line-clamp-1 ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>
              प्रशासनिक शब्दों का अर्थ सहित वाक्य प्रयोग
            </p>
            <div className={`text-slate-400 ${isCompact ? 'mt-0.5' : 'mt-1'}`}>
              <Languages className="w-4 h-4" />
            </div>
          </>
        );

      case 'banking_glossary':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-lg' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              बैंकिंग शब्दावली
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider uppercase mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              BANKING GLOSSARY
            </span>
            <div className={`rounded bg-amber-100 border border-amber-300 text-amber-950 font-bold flex items-center gap-1 ${isCompact ? 'my-1 px-1.5 py-0.2 text-[9px]' : 'my-1.5 px-2 py-0.5 text-[10px]'}`}>
              <Coins className="w-3 h-3 text-amber-700" />
              <span>भारतीय रिज़र्व बैंक (RBI)</span>
            </div>
            <span className={`text-slate-500 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>मानक बैंकिंग शब्दकोश</span>
          </>
        );

      case 'thought_of_day':
        return (
          <>
            <h3 className={`font-bold text-[#0f172a] leading-tight ${isLarge ? 'text-lg' : isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>
              आज का विचार
            </h3>
            <span className={`font-semibold text-[#0369a1] tracking-wider mt-0.5 ${isCompact ? 'text-[9px]' : 'text-[10px] sm:text-xs'}`}>
              Thought of the Day
            </span>
            <div className={`rounded-full bg-orange-100 text-orange-600 group-hover:rotate-45 transition-transform duration-300 ${isCompact ? 'my-1 p-1' : isLarge ? 'my-3 p-2' : 'my-1.5 p-1.5'}`}>
              <Sun className={`${isCompact ? 'w-4 h-4' : isLarge ? 'w-8 h-8' : 'w-6 h-6'} stroke-[2]`} />
            </div>
            <span className={`text-slate-600 font-medium ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>सुविचार एवं प्रेरणा</span>
          </>
        );

      default:
        return null;
    }
  };

  // Reusable tile wrapper
  const renderTile = (key: TabKey, index: number) => {
    const isVisible = tabConfig[key] ?? true;
    if (!isVisible && !isAdmin) {
      return null;
    }

    const isHiddenForUsers = !isVisible && isAdmin;
    const size = tabSizes[key] || 'normal';
    const isBeingDragged = draggedKey === key;
    const isDropTarget = dragOverKey === key && draggedKey !== key;
    const isTapSwapSelected = tapSwapKey === key;
    const isCurrentlyResizing = resizingState?.key === key;
    const activeDisplaySize = isCurrentlyResizing ? resizingState.previewSize : size;

    // Accent color determination
    const isRedAccent = ['home', 'monthly_report', 'quarterly_report', 'emagazine', 'rv_format', 'tolic', 'author_of_month', 'admin_glossary', 'thought_of_day'].includes(key);
    const accentBorder = isRedAccent ? 'border-[#b91c1c]/90' : 'border-[#0369a1]/90';

    // Card dimensions based on size
    let sizeClasses = 'p-3 sm:p-4 min-h-[130px]';
    if (activeDisplaySize === 'compact') {
      sizeClasses = 'p-2 sm:p-2.5 min-h-[105px]';
    } else if (activeDisplaySize === 'large') {
      sizeClasses = 'p-4 sm:p-5 min-h-[175px]';
    } else if (activeDisplaySize === 'wide') {
      sizeClasses = 'col-span-1 sm:col-span-2 p-3 sm:p-4 min-h-[130px]';
    }

    const chosenPresetId = tabBackgrounds[key] || 'default';
    const chosenPreset = TAB_COLOR_PRESETS.find(p => p.id === chosenPresetId);
    const customBgClass = chosenPreset && chosenPreset.id !== 'default' 
      ? `${chosenPreset.bgClass} border-2 ${chosenPreset.borderClass} ${chosenPreset.textClass || ''}` 
      : `bg-white/95 border-2 ${accentBorder}`;

    return (
      <div
        key={key}
        draggable={isAdmin}
        onDragStart={(e) => handleDragStart(key, e)}
        onDragOver={handleDragOver}
        onDragEnter={() => handleDragEnter(key)}
        onDragLeave={() => handleDragLeave(key)}
        onDrop={(e) => handleDrop(key, e)}
        onDragEnd={handleDragEnd}
        className={`group relative text-center flex flex-col items-center justify-center rounded-xl transition-all duration-200 shadow-md backdrop-blur-xs select-none ${sizeClasses}
          ${
            isDropTarget
              ? 'ring-4 ring-emerald-500 border-2 border-emerald-600 bg-emerald-100/95 scale-[1.03] shadow-2xl z-30'
              : isBeingDragged
              ? 'opacity-30 border-2 border-dashed border-red-600 ring-2 ring-red-400 bg-red-50/60 scale-95'
              : isTapSwapSelected
              ? 'ring-4 ring-amber-500 border-2 border-amber-600 bg-amber-100 scale-[1.02] shadow-xl z-20'
              : isLayoutEditMode
              ? 'ring-2 ring-amber-400 bg-amber-50/75 border-2 border-dashed border-amber-600 hover:bg-amber-100/80 cursor-grab active:cursor-grabbing'
              : isHiddenForUsers
              ? 'bg-slate-100/90 border-2 border-dashed border-slate-400 opacity-75'
              : `${customBgClass} hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`
          }`}
        onClick={() => {
          if (tapSwapKey && tapSwapKey !== key) {
            handleSwapDirect(tapSwapKey, key);
            const metaA = TAB_META_MAP[tapSwapKey];
            const metaB = TAB_META_MAP[key];
            showToast(`✓ स्थान बदला गया: ${metaA?.hindiTitle || tapSwapKey} ⇄ ${metaB?.hindiTitle || key}`);
            setTapSwapKey(null);
            return;
          }
          if (!isLayoutEditMode) {
            onSelectModal(key as ActiveModalType);
          }
        }}
      >
        {/* Left Decorative Bracket Accent */}
        {!isHiddenForUsers && !isLayoutEditMode && (
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-10 flex flex-col justify-between items-center pointer-events-none">
            <div className="w-2.5 h-1.5 bg-[#b91c1c] rounded-tl-sm" />
            <div className="w-1.5 h-4 bg-[#0369a1] rounded-xs" />
            <div className="w-2.5 h-1.5 bg-[#b91c1c] rounded-bl-sm" />
          </div>
        )}

        {/* Right Decorative Bracket Accent */}
        {!isHiddenForUsers && !isLayoutEditMode && (
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-10 flex flex-col justify-between items-center pointer-events-none">
            <div className="w-2.5 h-1.5 bg-[#b91c1c] rounded-tr-sm" />
            <div className="w-1.5 h-4 bg-[#0369a1] rounded-xs" />
            <div className="w-2.5 h-1.5 bg-[#b91c1c] rounded-br-sm" />
          </div>
        )}

        {/* Admin notice if tab is hidden from normal users */}
        {isHiddenForUsers && !isLayoutEditMode && (
          <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-slate-800 text-white text-[9px] font-bold shadow-xs z-20 flex items-center gap-1">
            <EyeOff className="w-2.5 h-2.5 text-amber-300" />
            <span>उपयोक्ताओं से छिपा हुआ</span>
          </span>
        )}

        {/* Drop Target Visual Overlay */}
        {isDropTarget && draggedKey && (
          <div className="absolute inset-0 z-40 rounded-xl bg-emerald-800/90 text-white flex flex-col items-center justify-center p-2 backdrop-blur-xs animate-in fade-in">
            <ArrowLeftRight className="w-6 h-6 animate-bounce mb-1 text-emerald-300" />
            <span className="font-extrabold text-xs">यहाँ छोड़ें (Drop to Swap)</span>
            <span className="text-[10px] text-emerald-100 truncate mt-0.5 font-medium">
              {TAB_META_MAP[draggedKey]?.hindiTitle || draggedKey} ⇄ {TAB_META_MAP[key]?.hindiTitle || key}
            </span>
          </div>
        )}

        {/* Tap-Swap Selected Indicator Banner */}
        {isTapSwapSelected && (
          <div className="absolute -top-3 left-1 right-1 z-30 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[9px] font-extrabold flex items-center justify-between shadow-md animate-pulse">
            <span>✓ चयनित (1/2) • अब दूसरे कार्ड पर टैप करें</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTapSwapKey(null);
              }}
              className="text-amber-200 hover:text-white ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ================= ADMIN LAYOUT CUSTOMIZER TOOLBAR OVERLAY ================= */}
        {isAdmin && isLayoutEditMode && (
          <div className="w-full mb-1.5 flex flex-col gap-1 pb-1 border-b border-amber-300">
            {/* Top row: Drag Grip, Tap Swap button, Position badge, Shift arrows */}
            <div className="flex items-center justify-between gap-1 w-full text-xs">
              <div className="flex items-center gap-1">
                {/* Drag Grip Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing px-1.5 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 flex items-center gap-0.5 text-[9px] font-extrabold shadow-2xs border border-amber-400"
                  title="खींचकर किसी भी कार्ड पर छोड़ें (Drag to Swap)"
                >
                  <GripVertical className="w-3 h-3 text-amber-800" />
                  <span className="hidden sm:inline">ड्रैग</span>
                </div>

                {/* 2-Tap Swap Button */}
                <button
                  type="button"
                  onClick={(e) => handleTapSwapSelect(key, e)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition-colors border ${
                    isTapSwapSelected
                      ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-slate-800 border-slate-300'
                  }`}
                  title="2-टैप से स्थान बदलें (Tap to Swap with any other card)"
                >
                  {isTapSwapSelected ? 'चयनित' : 'स्वैप'}
                </button>

                <span className="px-1.5 py-0.2 rounded-md bg-red-800 text-white font-black text-[9px] shadow-2xs">
                  #{index + 1}
                </span>
              </div>

              {/* Admin Tools: Visibility Eye, Background Palette, Shift Arrows */}
              <div className="flex items-center gap-1">
                {/* Show/Hide Eye Toggle */}
                {onToggleTabVisibility && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTabVisibility(key);
                    }}
                    className={`p-1 rounded text-[9px] font-bold border transition-colors shadow-2xs ${
                      isVisible 
                        ? 'bg-white hover:bg-slate-100 text-emerald-700 border-emerald-300' 
                        : 'bg-red-700 text-white border-red-800'
                    }`}
                    title={isVisible ? 'टैब दृश्यमान है (क्लिक करके छिपाएं)' : 'टैब छिपा हुआ है (क्लिक करके दिखाएं)'}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                )}

                {/* Background Color Palette Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBgPaletteFor(activeBgPaletteFor === key ? null : key);
                    }}
                    className="p-1 rounded bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs"
                    title="कार्ड पृष्ठभूमि रंग बदलें (Change Background Color)"
                  >
                    <Palette className="w-3 h-3" />
                  </button>

                  {/* Dropdown Color Presets */}
                  {activeBgPaletteFor === key && (
                    <div 
                      className="absolute top-full mt-1 -right-4 sm:right-0 z-50 p-2 bg-white rounded-xl shadow-2xl border-2 border-purple-300 grid grid-cols-2 gap-1.5 min-w-[190px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="col-span-2 text-[10px] font-bold text-slate-700 border-b border-slate-200 pb-1 flex items-center justify-between">
                        <span>पृष्ठभूमि रंग चुनें:</span>
                        <button 
                          type="button" 
                          onClick={() => setActiveBgPaletteFor(null)}
                          className="text-slate-400 hover:text-slate-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {TAB_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={(e) => handleSetTabColor(key, preset.id, e)}
                          className={`px-1.5 py-1 rounded text-[9px] font-bold border text-left flex items-center gap-1 transition-all ${
                            chosenPresetId === preset.id
                              ? 'ring-2 ring-red-600 border-red-600 font-black'
                              : 'border-slate-300 hover:border-slate-500'
                          } ${preset.bgClass}`}
                        >
                          <span className="w-2 h-2 rounded-full border border-slate-400" />
                          <span className="truncate">{preset.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shift earlier / later buttons */}
                <button
                  type="button"
                  onClick={(e) => handleShift(index, 'earlier', e)}
                  disabled={index === 0}
                  className={`p-1 rounded-md transition-colors ${
                    index === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'bg-white hover:bg-red-700 hover:text-white text-slate-800 border border-slate-300 shadow-2xs'
                  }`}
                  title="पहले ले जाएं (Move Earlier)"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleShift(index, 'later', e)}
                  disabled={index === tabOrder.length - 1}
                  className={`p-1 rounded-md transition-colors ${
                    index === tabOrder.length - 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'bg-white hover:bg-red-700 hover:text-white text-slate-800 border border-slate-300 shadow-2xs'
                  }`}
                  title="बाद में ले जाएं (Move Later)"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Middle row: Swap with dropdown */}
            <div className="w-full">
              <select
                aria-label="स्थान बदलें"
                value=""
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSwapDirect(key, e.target.value as TabKey, e);
                  }
                }}
                className="w-full text-[9px] px-1.5 py-0.5 rounded border border-amber-400 bg-white text-amber-950 font-bold hover:bg-amber-50 focus:ring-1 focus:ring-amber-500 outline-hidden cursor-pointer"
              >
                <option value="">🔄 स्थान बदलें (Swap)...</option>
                {tabOrder.map((otherKey, otherIdx) => {
                  if (otherKey === key) return null;
                  const otherMeta = TAB_META_MAP[otherKey];
                  return (
                    <option key={otherKey} value={otherKey}>
                      #{otherIdx + 1} {otherMeta?.hindiTitle || otherKey}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Bottom row: Size selector 1-click pills */}
            <div className="flex items-center justify-center gap-1 w-full pt-0.5">
              <button
                type="button"
                onClick={(e) => handleSetSize(key, 'compact', e)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold transition-colors ${
                  activeDisplaySize === 'compact'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                }`}
                title="छोटा आकार (Compact)"
              >
                छोटा
              </button>

              <button
                type="button"
                onClick={(e) => handleSetSize(key, 'normal', e)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold transition-colors ${
                  activeDisplaySize === 'normal'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                }`}
                title="सामान्य आकार (Normal)"
              >
                सामान्य
              </button>

              <button
                type="button"
                onClick={(e) => handleSetSize(key, 'wide', e)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold transition-colors ${
                  activeDisplaySize === 'wide'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                }`}
                title="चौड़ा 2-कॉलम (Wide 2-col)"
              >
                चौड़ा
              </button>

              <button
                type="button"
                onClick={(e) => handleSetSize(key, 'large', e)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold transition-colors ${
                  activeDisplaySize === 'large'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                }`}
                title="बड़ा आकार (Large)"
              >
                बड़ा
              </button>
            </div>
          </div>
        )}

        {/* ================= CORNER RESIZE HANDLE (DRAG OR CLICK TO RESIZE) ================= */}
        {isAdmin && (
          <div
            className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/85 hover:bg-slate-950 text-amber-300 hover:text-white cursor-nwse-resize shadow-md flex items-center gap-1 select-none z-30 transition-all border border-amber-400/50 group/handle ${
              isLayoutEditMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="आकार बदलें: कोने को खींचें (Drag) या क्लिक करके बदलें (Click to Cycle)"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleResizePointerDown(key, size, e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              const t = e.touches[0];
              handleResizePointerDown(key, size, t.clientX, t.clientY);
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleCycleSize(key, e);
            }}
          >
            <Maximize2 className="w-2.5 h-2.5 group-hover/handle:scale-125 transition-transform" />
            <span className="text-[8px] font-black tracking-tight">
              {activeDisplaySize === 'compact' ? 'छोटा' : activeDisplaySize === 'normal' ? 'सामान्य' : activeDisplaySize === 'wide' ? 'चौड़ा' : 'बड़ा'}
            </span>
            <span className="text-[9px] text-amber-400 font-mono">⤡</span>
          </div>
        )}

        {/* Resizing Live Preview Floating Badge */}
        {isCurrentlyResizing && (
          <div className="absolute -top-7 right-0 px-2 py-0.5 rounded bg-slate-950 text-amber-300 text-[9px] font-black shadow-lg border border-amber-400 z-50 animate-pulse">
            ⤡ नया आकार: {activeDisplaySize}
          </div>
        )}

        {/* Card Content */}
        {renderCardContent(key, activeDisplaySize)}
      </div>
    );
  };

  const visibleTabCount = Object.values(tabConfig).filter(Boolean).length;

  // Split tabs for the Classic 3-Row Layout:
  // Top row: slots 0 to 4 (5 tabs)
  // Middle left: slots 5 to 7 (3 tabs)
  // Middle right: slots 8 to 9 (2 tabs)
  // Bottom row: slots 10 to 14 (5 tabs)
  const topTabs = tabOrder.slice(0, 5);
  const midLeftTabs = tabOrder.slice(5, 8);
  const midRightTabs = tabOrder.slice(8, 10);
  const bottomTabs = tabOrder.slice(10, 15);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2">
      {/* ================= THOUGHT TAB CONTENT SCROLLING ON TOP ================= */}
      <div className="w-full mb-4 sm:mb-5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-950 to-red-950 text-white shadow-lg border-2 border-amber-400/80 overflow-hidden relative backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between">
          {/* Left static badge */}
          <button
            type="button"
            onClick={() => onSelectModal('thought_of_day')}
            className="shrink-0 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-colors cursor-pointer z-10 shadow-md"
            title="आज का विचार पढ़ने हेतु क्लिक करें"
          >
            <Sun className="w-4 h-4 text-slate-950 animate-spin-slow" />
            <span className="whitespace-nowrap uppercase tracking-wider font-extrabold">आज का प्रेरक विचार</span>
          </button>

          {/* Continuous scrolling marquee ticker */}
          <div 
            className="flex-1 overflow-hidden py-2.5 px-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => onSelectModal('thought_of_day')}
            title="क्लिक करके पूरा विचार देखें"
          >
            <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-medium text-amber-100">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 inline shrink-0" />
                <strong className="text-amber-300 font-bold">"{activeThought.hindi}"</strong>
                <span className="text-amber-200/90 italic">— {activeThought.author}</span>
              </span>
              <span className="text-amber-400/60">•</span>
              <span className="text-slate-300 text-xs hidden md:inline">
                {activeThought.english}
              </span>
              <span className="text-amber-400/60">•</span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 inline shrink-0" />
                <strong className="text-amber-300 font-bold">"{activeThought.hindi}"</strong>
                <span className="text-amber-200/90 italic">— {activeThought.author}</span>
              </span>
            </div>
          </div>

          {/* Right quick actions: Audio Speech & Open Modal */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border-t sm:border-t-0 sm:border-l border-white/10 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeakThought(activeThought.hindi);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors"
              title="सुविचार हिंदी में सुनें"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingSpeech ? 'animate-bounce text-amber-200' : ''}`} />
              <span className="hidden sm:inline">{isPlayingSpeech ? 'बज रहा है...' : 'सुनें'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectModal('thought_of_day')}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 transition-transform active:scale-95 shadow-2xs"
            >
              <span>विस्तार से देखें →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= ADMIN CONTROLS & LAYOUT SWITCHER ================= */}
      {isAdmin && (
        <div className="mb-4 flex flex-col gap-2">
          {isLayoutEditMode ? (
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-md border-2 border-amber-300 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 text-amber-300 shadow-sm">
                    <Move className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base leading-tight flex items-center gap-2 text-slate-950">
                      <span>🛠️ आसान ड्रैग, रीसाइज़, दृश्यता एवं पृष्ठभूमि मोड</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-bold">
                        सक्रिय
                      </span>
                    </h4>
                    <p className="text-xs font-semibold text-amber-950 mt-0.5">
                      <strong>ड्रैग:</strong> कार्ड को पकड़कर छोड़ें • <strong>रीसाइज़:</strong> 1-क्लिक से छोटा/बड़ा/चौड़ा करें • <strong>दृश्यता:</strong> आंख (👁️) से छिपाएं/दिखाएं • <strong>रंग:</strong> पैलेट (🎨) से रंग बदलें।
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSetAllSizes('normal')}
                    className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-2xs transition-colors"
                    title="सभी कार्ड्स को सामान्य आकार पर सेट करें"
                  >
                    सभी सामान्य
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetAllSizes('compact')}
                    className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-2xs transition-colors"
                    title="सभी कार्ड्स को कॉम्पैक्ट आकार पर सेट करें"
                  >
                    सभी कॉम्पैक्ट
                  </button>

                  <button
                    type="button"
                    onClick={onResetLayout}
                    className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                    title="डिफ़ॉल्ट क्रम एवं आकार पर रीसेट करें"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-700" />
                    <span>मूल लेआउट</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenTabManager}
                    className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>विस्तृत सूची</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLayoutEditMode(false);
                      setTapSwapKey(null);
                      setActiveBgPaletteFor(null);
                    }}
                    className="px-3.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>पूर्ण (Done)</span>
                  </button>
                </div>
              </div>

              {/* Quick tip banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-amber-950/20 text-[11px] font-semibold text-slate-950 border border-amber-900/20">
                <span className="flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5 text-amber-950" />
                  <span><strong>सुझाव:</strong> प्रत्येक कार्ड पर आंख आइकन (👁️) से छिपाएं/दिखाएं और पैलेट (🎨) से अलग रंग लगाएं।</span>
                </span>
                <span className="text-amber-950/80">
                  क्रम, आकार व रंग स्वतः सुरक्षित (Auto-Saved) हैं
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-amber-50/90 border border-amber-300 text-xs shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-amber-700" />
                  <span>प्रशासक लेआउट दृश्य:</span>
                </span>
                {/* 4x4 vs Classic Mode Switcher */}
                <div className="inline-flex rounded-lg border border-amber-300 bg-white p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleSetLayoutMode('4x4')}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                      gridLayoutMode === '4x4'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>4×4 रो-कॉलम मैट्रिक्स (15 टैब)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetLayoutMode('classic')}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                      gridLayoutMode === 'classic'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span>क्लासिक 3-पंक्ति लेआउट</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsLayoutEditMode(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>ड्रैग, रीसाइज़ व रंग बदलें</span>
                </button>
                {onOpenTabManager && (
                  <button
                    type="button"
                    onClick={onOpenTabManager}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-amber-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    title="टैब दृश्यता व सामग्री प्रबंधन"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">टैब प्रबंधन</span>
                  </button>
                )}
                {onOpenBackgroundManager && (
                  <button
                    type="button"
                    onClick={onOpenBackgroundManager}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-amber-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    title="पोर्टल पृष्ठभूमि बदलें"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">पृष्ठभूमि</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 4x4 ROW-COLUMN GRID LAYOUT (DEFAULT) ================= */}
      {gridLayoutMode === '4x4' ? (
        <div>
          {/* 4 Columns x 4 Rows Matrix (15 Tab Tiles + 16th Institutional Hub Cell) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-4 sm:mb-6">
            {tabOrder.slice(0, 15).map((key, i) => renderTile(key, i))}

            {/* 16th Cell to complete the 4x4 Row-Column Matrix */}
            <div 
              className="group relative text-center flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-xl transition-all duration-200 shadow-md backdrop-blur-xs select-none min-h-[130px] bg-gradient-to-br from-red-900 via-slate-900 to-amber-950 text-white border-2 border-amber-400 hover:shadow-xl hover:scale-[1.01]"
              onClick={() => onSelectModal('home')}
            >
              <div className="w-full flex items-center justify-between gap-1 text-[10px] text-amber-300">
                <span className="font-mono">सेल 16/16</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded">आंचलिक हब</span>
              </div>
              <div className="my-1 text-center">
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                  सेन्ट्रल बैंक ऑफ़ इण्डिया
                </h3>
                <span className="text-[10px] sm:text-xs text-amber-300 font-semibold block mt-0.5">
                  आंचलिक कार्यालय पटना
                </span>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                  राजभाषा पोर्टल एवं संधारण केंद्र
                </p>
              </div>
              <div className="w-full flex items-center justify-center gap-1.5 pt-1 border-t border-white/20 text-xs">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUpload();
                    }}
                    className="px-2.5 py-1 bg-[#b91c1c] hover:bg-red-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>त्वरित अपलोड</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectModal('home');
                  }}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                >
                  <span>पोर्टल हब →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CLASSIC 3-ROW LAYOUT ================= */
        <div>
          {/* TOP ROW: 5 TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {topTabs.map((key, i) => renderTile(key, i))}
          </div>

          {/* MIDDLE SECTION: 3 COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 sm:mb-6">
            {/* LEFT COLUMN: 3 Items */}
            <div className="lg:col-span-3 flex flex-col gap-3.5">
              {midLeftTabs.map((key, i) => renderTile(key, 5 + i))}
            </div>

            {/* CENTER COLUMN: Hero Interactive Portal Canvas */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-white/95 border border-amber-900/20 p-5 sm:p-6 shadow-md backdrop-blur-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span>सेन्ट्रल बैंक ऑफ़ इण्डिया • आंचलिक कार्यालय पटना</span>
                  </div>

                  {currentUser && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
                      {isAdmin ? (
                        <span className="font-bold text-red-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                          <span>प्रशासक (Admin)</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>{currentUser.regionHindi || 'क्षेत्रीय उपयोक्ता'}: {currentUser.displayName}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  राजभाषा प्रबंधन एवं प्रतिवेदन संधारण प्रणाली
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed">
                  क्षेत्रीय कार्यालयों द्वारा प्रतिवेदन सीधे 
                  <strong className="text-red-700"> सुरक्षित केंद्रीय क्लाउड सर्वर </strong> 
                  पर अधिकृत रूप से अपलोड व संधारित करने हेतु पोर्टल।
                </p>

                {/* Quick Upload Action Callout for Admin */}
                {isAdmin && (
                  <>
                    <div className="mt-4 p-3.5 bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 rounded-xl border border-red-200">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-sm text-red-950 flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-red-600" />
                            <span>प्रतिवेदन अपलोड करें (प्रशासक)</span>
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            मासिक, तिमाही, ई-पत्रिका, परिपत्र आदि सभी प्रारूप अधिकृत रूप से अपलोड करें
                          </p>
                        </div>
                        <button
                          id="center-quick-upload-btn"
                          onClick={onOpenUpload}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-xs shadow-sm transition-transform active:scale-95 whitespace-nowrap"
                        >
                          अभी अपलोड करें →
                        </button>
                      </div>
                    </div>

                    {/* Role & Permissions Note */}
                    <div className="mt-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>
                        🔒 <strong>अपलोड नीति:</strong> मुख्य सामग्री केवल आंचलिक प्रशासक द्वारा अपलोड योग्य है।
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0 ml-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>प्रशासकीय नियंत्रण सक्रिय</span>
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>सत्यमेव जयते • भारत सरकार गृह मंत्रालय</span>
                <span className="font-medium text-[#0369a1]">आंचलिक कार्यालय, मौर्या लोक कॉम्प्लेक्स, पटना</span>
              </div>
            </div>

            {/* RIGHT COLUMN: 2 Items */}
            <div className="lg:col-span-3 flex flex-col gap-3.5">
              {midRightTabs.map((key, i) => renderTile(key, 8 + i))}
            </div>
          </div>

          {/* BOTTOM ROW: 5 TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {bottomTabs.map((key, i) => renderTile(key, 10 + i))}
          </div>
        </div>
      )}

      {/* ================= FLOATING FEEDBACK TOAST ================= */}
      {toastFeedback && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-slate-950/95 text-white border-2 border-amber-400 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-amber-100 flex-1 leading-snug">
            {toastFeedback}
          </span>
          <button
            type="button"
            onClick={() => setToastFeedback(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
