import React from 'react';
import { Slide, SlideLayout } from '../../types/presentation';
import { Plus, Copy, Trash2, Play } from 'lucide-react';

interface SlideSorterViewProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  onStartSlideshow: (fromBeginning: boolean) => void;
  isDarkMode: boolean;
}

export const SlideSorterView: React.FC<SlideSorterViewProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onStartSlideshow,
  isDarkMode,
}) => {
  return (
    <div
      id="slide-sorter-grid-view"
      className={`flex-1 p-8 overflow-y-auto select-none ${
        isDarkMode ? 'bg-[#121214] text-zinc-100' : 'bg-[#E5E7EB] text-zinc-900'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Clasificador de Diapositivas</h2>
            <p className="text-xs opacity-70">
              Vista general del mazo completo. Haz doble clic en una diapositiva para editarla.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddSlide('titleAndContent')}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Diapositiva</span>
            </button>
            <button
              onClick={() => onStartSlideshow(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer border border-zinc-700"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Presentar</span>
            </button>
          </div>
        </div>

        {/* Grid of Slide Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {slides.map((slide, index) => {
            const isActive = index === activeSlideIndex;

            return (
              <div
                key={slide.id}
                onClick={() => onSelectSlide(index)}
                className={`group relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer shadow-md ${
                  isActive
                    ? 'border-orange-500 ring-4 ring-orange-500/20 scale-[1.02]'
                    : isDarkMode
                    ? 'border-zinc-700 hover:border-zinc-500'
                    : 'border-zinc-300 hover:border-zinc-400'
                }`}
                style={{ backgroundColor: slide.background?.color || '#FFFFFF' }}
              >
                {/* 16:9 Aspect ratio preview container */}
                <div className="aspect-video relative overflow-hidden">
                  {/* Miniature rendered elements */}
                  <div
                    className="w-[960px] h-[540px] origin-top-left absolute top-0 left-0 pointer-events-none"
                    style={{ transform: 'scale(0.24)' }}
                  >
                    {slide.elements.map((el) => (
                      <div
                        key={el.id}
                        className="absolute overflow-hidden"
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: el.type === 'shape' ? el.fill : undefined,
                          borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                        }}
                      >
                        {el.type === 'text' && (
                          <p
                            style={{
                              fontSize: `${el.fontSize || 18}px`,
                              fontWeight: el.fontWeight || 'normal',
                              color: el.color || '#1E293B',
                              lineHeight: 1.2,
                            }}
                          >
                            {el.content}
                          </p>
                        )}
                        {el.type === 'image' && el.src && (
                          <img src={el.src} alt="" className="w-full h-full object-contain" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer bar */}
                <div
                  className={`px-3 py-2 flex items-center justify-between border-t text-xs ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <span className="font-bold text-orange-500">{index + 1}</span>
                  <span className="truncate max-w-[120px] opacity-75">{slide.title}</span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSlide(index);
                      }}
                      className="p-1 rounded hover:bg-zinc-500/20 text-zinc-500"
                      title="Duplicar"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                      }}
                      disabled={slides.length <= 1}
                      className="p-1 rounded hover:bg-red-500/20 text-red-500 disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
