import React, { useState } from 'react';
import { TabVisibilityConfig, TabKey, TabSizeConfig, TabCardSize } from '../types';
import { 
  SlidersHorizontal, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Columns,
  Grid,
  Info,
  Sparkles,
  GripVertical
} from 'lucide-react';
import { DEFAULT_TAB_VISIBILITY, DEFAULT_TAB_ORDER, DEFAULT_TAB_SIZES } from '../data/defaultData';

export interface TabItemMeta {
  key: TabKey;
  hindiTitle: string;
  englishTitle: string;
  category: 'core' | 'reports' | 'resources';
  description: string;
}

export const TAB_ITEMS: TabItemMeta[] = [
  {
    key: 'home',
    hindiTitle: 'मुख्य पृष्ठ',
    englishTitle: 'HOME PAGE',
    category: 'core',
    description: 'पोर्टल का मुख्य द्वार एवं केंद्रीय जानकारी',
  },
  {
    key: 'monthly_report',
    hindiTitle: 'मासिक प्रतिवेदन (R.V. 1)',
    englishTitle: 'MONTHLY REPORT',
    category: 'reports',
    description: 'उपयोक्ता एवं शाखाओं द्वारा मासिक प्रगति रिपोर्ट अपलोड व संधारण',
  },
  {
    key: 'quarterly_report',
    hindiTitle: 'तिमाही प्रगति रिपोर्ट (QPR)',
    englishTitle: 'QUARTERLY PROGRESS REPORT',
    category: 'reports',
    description: 'तिमाही प्रगति समीक्षा एवं विश्लेषण प्रपत्र',
  },
  {
    key: 'emagazine',
    hindiTitle: 'ई-पत्रिका "पाटलिपुत्र सौरभ"',
    englishTitle: 'E-MAGAZINE',
    category: 'resources',
    description: 'साहित्यिक रचनाएं, आलेख एवं अंचल पत्रिका (केवल प्रशासक अपलोड)',
  },
  {
    key: 'olic',
    hindiTitle: 'राजभाषा कार्यान्वयन समिति',
    englishTitle: 'OLIC COMMITTEE',
    category: 'core',
    description: 'समिति गठन, बैठक कार्यवृत्त एवं त्रैमासिक संकल्प',
  },
  {
    key: 'rv_format',
    hindiTitle: 'आर. वी. प्रारूप',
    englishTitle: 'R.V. FORMAT',
    category: 'reports',
    description: 'क्षेत्रीय कार्यालय में पदस्थ राजभाषा प्रभारी का निर्धारित प्रारूप',
  },
  {
    key: 'annual_programme',
    hindiTitle: 'वार्षिक कार्यक्रम',
    englishTitle: 'ANNUAL PROGRAMME',
    category: 'core',
    description: 'गृह मंत्रालय द्वारा निर्धारित वार्षिक लक्ष्य व दिशा-निर्देश',
  },
  {
    key: 'mis_portal',
    hindiTitle: 'सूचना प्रबंधन प्रणाली (MIS Portal)',
    englishTitle: 'MIS PORTAL',
    category: 'reports',
    description: 'राजभाषा विभाग / गृह मंत्रालय का एमआईएस पोर्टल लिंकेज',
  },
  {
    key: 'hindi_workshop',
    hindiTitle: 'हिंदी कार्यशाला',
    englishTitle: 'HINDI WORKSHOP',
    category: 'resources',
    description: 'त्रैमासिक कार्यशाला, प्रशिक्षण सामग्री एवं रिपोर्ट (केवल प्रशासक अपलोड)',
  },
  {
    key: 'tolic',
    hindiTitle: 'नगर राजभाषा कार्यान्वयन समिति',
    englishTitle: 'TOLIC PATNA',
    category: 'core',
    description: 'नराकास पटना (बैंक) मंच, बैठकें एवं पुरस्कार विवरण',
  },
  {
    key: 'circulars',
    hindiTitle: 'परिपत्र एवं आदेश',
    englishTitle: 'CIRCULARS & ORDERS',
    category: 'core',
    description: 'राजभाषा विभाग एवं केंद्रीय बैंक के आधिकारिक परिपत्र (केवल प्रशासक अपलोड)',
  },
  {
    key: 'author_of_month',
    hindiTitle: 'इस माह के चयनित साहित्यकार',
    englishTitle: 'AUTHOR OF THE MONTH',
    category: 'resources',
    description: 'राष्ट्रकवि रामधारी सिंह "दिनकर" एवं साहित्यकार जीवन-परिचय',
  },
  {
    key: 'admin_glossary',
    hindiTitle: 'सरल प्रशासनिक शब्दावली',
    englishTitle: 'ADMINISTRATIVE GLOSSARY',
    category: 'resources',
    description: 'दैनिक कामकाज में उपयोगी मानक प्रशासनिक शब्दकोश',
  },
  {
    key: 'banking_glossary',
    hindiTitle: 'बैंकिंग शब्दावली (RBI)',
    englishTitle: 'BANKING GLOSSARY',
    category: 'resources',
    description: 'भारतीय रिज़र्व बैंक द्वारा स्वीकृत मानक बैंकिंग शब्दावली',
  },
  {
    key: 'thought_of_day',
    hindiTitle: 'आज का विचार',
    englishTitle: 'THOUGHT OF THE DAY',
    category: 'resources',
    description: 'दैनिक हिंदी सुविचार, प्रेरणा वाक्य एवं ध्वनि उच्चारण',
  },
];

export const TAB_META_MAP: Record<TabKey, TabItemMeta> = TAB_ITEMS.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {} as Record<TabKey, TabItemMeta>);

interface AdminTabManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabConfig: TabVisibilityConfig;
  onUpdateTabConfig: (newConfig: TabVisibilityConfig) => void;
  tabOrder: TabKey[];
  onUpdateTabOrder: (newOrder: TabKey[]) => void;
  tabSizes: TabSizeConfig;
  onUpdateTabSizes: (newSizes: TabSizeConfig) => void;
  onResetLayout: () => void;
}

export const AdminTabManagerModal: React.FC<AdminTabManagerModalProps> = ({
  isOpen,
  onClose,
  tabConfig,
  onUpdateTabConfig,
  tabOrder,
  onUpdateTabOrder,
  tabSizes,
  onUpdateTabSizes,
  onResetLayout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'layout' | 'visibility'>('layout');
  const [selectedSwapKey, setSelectedSwapKey] = useState<TabKey | null>(null);
  const [draggedTabKey, setDraggedTabKey] = useState<TabKey | null>(null);
  const [dragOverTabKey, setDragOverTabKey] = useState<TabKey | null>(null);

  if (!isOpen) return null;

  // Visibility handlers
  const handleToggleVisibility = (key: TabKey) => {
    onUpdateTabConfig({
      ...tabConfig,
      [key]: !tabConfig[key],
    });
  };

  const handleEnableAll = () => {
    const allEnabled: TabVisibilityConfig = { ...tabConfig };
    (Object.keys(allEnabled) as TabKey[]).forEach((k) => {
      allEnabled[k] = true;
    });
    onUpdateTabConfig(allEnabled);
  };

  const handleResetVisibilityDefaults = () => {
    onUpdateTabConfig(DEFAULT_TAB_VISIBILITY);
  };

  // Drag & Drop reorder handler
  const handleDragReorder = (sourceKey: TabKey, targetKey: TabKey) => {
    if (sourceKey === targetKey) return;
    const newOrder = [...tabOrder];
    const sourceIndex = newOrder.indexOf(sourceKey);
    const targetIndex = newOrder.indexOf(targetKey);
    if (sourceIndex === -1 || targetIndex === -1) return;

    // Move source to target position
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    onUpdateTabOrder(newOrder);
    setDraggedTabKey(null);
    setDragOverTabKey(null);
  };

  // Swap / Move position handlers
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tabOrder.length) return;

    const newOrder = [...tabOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onUpdateTabOrder(newOrder);
  };

  const handleDirectSwap = (keyA: TabKey, keyB: TabKey) => {
    if (keyA === keyB) return;
    const newOrder = [...tabOrder];
    const indexA = newOrder.indexOf(keyA);
    const indexB = newOrder.indexOf(keyB);
    if (indexA === -1 || indexB === -1) return;

    newOrder[indexA] = keyB;
    newOrder[indexB] = keyA;
    onUpdateTabOrder(newOrder);
    setSelectedSwapKey(null);
  };

  // Resize handler
  const handleSizeChange = (key: TabKey, newSize: TabCardSize) => {
    onUpdateTabSizes({
      ...tabSizes,
      [key]: newSize,
    });
  };

  const visibleCount = Object.values(tabConfig).filter(Boolean).length;

  const getSizeLabel = (size: TabCardSize) => {
    switch (size) {
      case 'compact': return 'छोटा (Compact)';
      case 'normal': return 'सामान्य (Normal)';
      case 'wide': return 'चौड़ा (Wide 2-col)';
      case 'large': return 'बड़ा (Large)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-900 via-amber-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <SlidersHorizontal className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>टैब स्थान व आकार प्रबंधन (Tab Layout & Controls)</span>
                <span className="px-2 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-bold">
                  प्रशासक अधिकार (Admin Right)
                </span>
              </h2>
              <p className="text-xs text-amber-200">
                टैब का स्थान बदलें (Swap Positions), कार्ड का आकार बदलें (Resize) एवं दृश्यता नियंत्रित करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs: Swap & Resize VS Visibility */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('layout')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-t-2 ${
                activeSubTab === 'layout'
                  ? 'bg-white text-red-900 border-red-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-red-700" />
              <span>स्थान बदलें व आकार बदलें (Swap & Resize)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('visibility')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 border-t-2 ${
                activeSubTab === 'visibility'
                  ? 'bg-white text-red-900 border-red-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>टैब दृश्यता (Visibility)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {visibleCount}/{TAB_ITEMS.length}
              </span>
            </button>
          </div>

          <div className="pb-2">
            {activeSubTab === 'layout' ? (
              <button
                onClick={onResetLayout}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold transition-colors text-xs flex items-center gap-1 shadow-2xs"
                title="मूल क्रम एवं सामान्य आकार पर रीसेट करें"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>लेआउट रीसेट करें</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnableAll}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold transition-colors text-xs flex items-center gap-1 shadow-2xs"
                >
                  <Eye className="w-3 h-3 text-emerald-600" />
                  <span>सभी दिखाएं</span>
                </button>
                <button
                  onClick={handleResetVisibilityDefaults}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold transition-colors text-xs flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>डिफ़ॉल्ट</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex items-start justify-between gap-2 shrink-0">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {activeSubTab === 'layout' ? (
                <>
                  <strong>आसान ड्रैग और रीसाइज़:</strong> किसी भी आइटम को <strong>ड्रैग हैंडल (⋮⋮)</strong> से पकड़कर सीधे ऊपर/नीचे खींचें (Drag & Drop), या तीर <strong>↑ / ↓</strong> व ड्रॉपडाउन का प्रयोग करें। <strong>आकार बदलने हेतु</strong> 'छोटा', 'सामान्य', 'चौड़ा' या 'बड़ा' बटन चुनें।
                </>
              ) : (
                <>
                  <strong>दृश्यता नियंत्रण:</strong> किसी टैब को बंद करने पर वह सामान्य उपयोक्ताओं को दिखाई नहीं देगा। प्रशासक को यह "छिपा हुआ" बैज के साथ दिखाई देगा।
                </>
              )}
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded bg-amber-200 font-mono text-[11px] font-bold text-amber-900">
            स्वतः सुरक्षित
          </span>
        </div>

        {/* Tab 1: Layout (Swap & Resize) */}
        {activeSubTab === 'layout' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5">
            {tabOrder.map((key, index) => {
              const meta = TAB_META_MAP[key] || {
                key,
                hindiTitle: key,
                englishTitle: key,
                category: 'core',
                description: '',
              };
              const currentSize = tabSizes[key] || 'normal';
              const isVisible = tabConfig[key] ?? true;

              const isBeingDragged = draggedTabKey === key;
              const isDragOver = dragOverTabKey === key;

              return (
                <div
                  key={key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', key);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggedTabKey(key);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDragEnter={() => {
                    if (draggedTabKey && draggedTabKey !== key) {
                      setDragOverTabKey(key);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverTabKey === key) {
                      setDragOverTabKey(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const source = draggedTabKey || (e.dataTransfer.getData('text/plain') as TabKey);
                    if (source) {
                      handleDragReorder(source, key);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggedTabKey(null);
                    setDragOverTabKey(null);
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400 scale-[1.01]'
                      : isBeingDragged
                      ? 'opacity-40 border-dashed border-red-500 bg-red-50'
                      : selectedSwapKey === key
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Left: Drag Handle, Position Badge & Titles */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Visual Drag Grip */}
                    <div 
                      className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                      title="खींचकर ऊपर/नीचे ले जाएं (Drag to Reorder)"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Index Badge */}
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-900 border border-red-300 font-black text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {meta.hindiTitle}
                        </h4>
                        <span className="text-[11px] font-bold text-[#0369a1] uppercase">
                          ({meta.englishTitle})
                        </span>
                        {!isVisible && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5 text-amber-600" />
                            <span>छिपा हुआ</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Middle & Right: Position Swap Controls & Resize Buttons */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Shift Up/Down buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className={`p-1.5 rounded-md transition-colors ${
                          index === 0
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-white hover:text-red-700 shadow-2xs'
                        }`}
                        title="ऊपर ले जाएं (Move Earlier)"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === tabOrder.length - 1}
                        className={`p-1.5 rounded-md transition-colors ${
                          index === tabOrder.length - 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-white hover:text-red-700 shadow-2xs'
                        }`}
                        title="नीचे ले जाएं (Move Later)"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Swap With Dropdown */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
                        स्वैप:
                      </span>
                      <select
                        aria-label={`${meta.hindiTitle} का स्थान बदलें`}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDirectSwap(key, e.target.value as TabKey);
                          }
                        }}
                        className="text-xs px-2 py-1.5 rounded-lg border border-amber-300 bg-amber-50/80 text-amber-950 font-bold hover:bg-amber-100 transition-colors focus:ring-2 focus:ring-amber-400 outline-hidden"
                      >
                        <option value="">स्थान बदलें... (Swap)</option>
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

                    {/* Resize Pill Group */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold px-1 hidden sm:inline">
                        आकार:
                      </span>

                      {/* Compact */}
                      <button
                        type="button"
                        onClick={() => handleSizeChange(key, 'compact')}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                          currentSize === 'compact'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                        title="छोटा आकार (Compact Card)"
                      >
                        छोटा
                      </button>

                      {/* Normal */}
                      <button
                        type="button"
                        onClick={() => handleSizeChange(key, 'normal')}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                          currentSize === 'normal'
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                        title="सामान्य आकार (Normal Card)"
                      >
                        सामान्य
                      </button>

                      {/* Wide */}
                      <button
                        type="button"
                        onClick={() => handleSizeChange(key, 'wide')}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                          currentSize === 'wide'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                        title="चौड़ा आकार - 2 कॉलम (Wide 2-Column Card)"
                      >
                        <Columns className="w-3 h-3" />
                        <span>चौड़ा</span>
                      </button>

                      {/* Large */}
                      <button
                        type="button"
                        onClick={() => handleSizeChange(key, 'large')}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                          currentSize === 'large'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                        }`}
                        title="बड़ा आकार (Large Card)"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>बड़ा</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Visibility Manager */}
        {activeSubTab === 'visibility' && (
          <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-1">
            {tabOrder.map((key) => {
              const item = TAB_META_MAP[key];
              if (!item) return null;
              const isVisible = tabConfig[key] ?? true;

              return (
                <div
                  key={key}
                  className={`py-3 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isVisible ? 'hover:bg-slate-50' : 'bg-slate-50/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(key)}
                      className={`mt-0.5 p-1.5 rounded-lg border transition-colors ${
                        isVisible
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isVisible ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                          {item.hindiTitle}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          {item.englishTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Switch button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      isVisible
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isVisible ? 'दिख रहा है (Visible)' : 'छिपा हुआ (Hidden)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>सभी परिवर्तन मुख्य पृष्ठ पर तुरंत प्रभावी होते हैं।</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
          >
            सहेजें एवं बंद करें (Save & Close)
          </button>
        </div>

      </div>
    </div>
  );
};
