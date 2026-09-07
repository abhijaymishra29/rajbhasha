import React, { useState, useEffect } from 'react';
import { BackgroundImage } from '../types';
import { ChevronLeft, ChevronRight, Pause, Play, Image as ImageIcon, Settings } from 'lucide-react';

interface BackgroundCarouselProps {
  images: BackgroundImage[];
  onOpenAdminManager?: () => void;
  isAdmin?: boolean;
}

export const BackgroundCarousel: React.FC<BackgroundCarouselProps> = ({
  images,
  onOpenAdminManager,
  isAdmin,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance every 6 seconds if playing
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPlaying, images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" />
    );
  }

  const currentImg = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none select-none">
      {/* Background Images with smooth opacity cross-fade */}
      {images.map((img, idx) => (
        <div
          key={img.id || idx}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: idx === currentIndex ? 1 : 0,
            transform: idx === currentIndex ? 'scale(1.02)' : 'scale(1)',
            transition: 'opacity 1.2s ease-in-out, transform 8s ease-out',
          }}
        >
          <img
            src={img.url}
            alt={img.title || 'राजभाषा पृष्ठभूमि'}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Official Parchment/Warm Off-White Overlay to match the template's pristine aesthetic and ensure WCAG AA readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-amber-50/88 to-white/94 backdrop-blur-[1.5px]" />

      {/* Subtle bottom-right control panel for users/admin to control slideshow */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-full shadow-md border border-amber-200/80 text-xs transition-all">
        <span className="flex items-center gap-1 font-medium text-amber-900 pr-1">
          <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">पृष्ठभूमि {currentIndex + 1}/{images.length}</span>
        </span>

        <button
          id="bg-prev-btn"
          onClick={handlePrev}
          aria-label="Previous background"
          className="p-1 hover:bg-amber-100 rounded-full transition-colors text-slate-700"
          title="पिछली छवि (Previous)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          id="bg-playpause-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          className="p-1 hover:bg-amber-100 rounded-full transition-colors text-slate-700"
          title={isPlaying ? 'रोकें (Pause)' : 'आरंभ करें (Play)'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        <button
          id="bg-next-btn"
          onClick={handleNext}
          aria-label="Next background"
          className="p-1 hover:bg-amber-100 rounded-full transition-colors text-slate-700"
          title="अगली छवि (Next)"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {isAdmin && onOpenAdminManager && (
          <button
            id="bg-admin-manage-btn"
            onClick={onOpenAdminManager}
            className="ml-1 pl-2 border-l border-amber-200 flex items-center gap-1 font-semibold text-red-700 hover:text-red-900 transition-colors"
            title="प्रशासक: पृष्ठभूमि छवियां बदलें"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden md:inline">छवि प्रबंधन</span>
          </button>
        )}
      </div>

      {/* Floating subtle caption of current image */}
      {currentImg && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-auto hidden md:block max-w-sm">
          <div className="bg-white/85 backdrop-blur-sm px-3 py-1 rounded-lg border border-amber-200/60 shadow-xs text-[11px] text-slate-600 truncate">
            <span className="font-semibold text-amber-950 mr-1.5">{currentImg.title}</span>
            {currentImg.caption && <span className="opacity-75">({currentImg.caption})</span>}
          </div>
        </div>
      )}
    </div>
  );
};
