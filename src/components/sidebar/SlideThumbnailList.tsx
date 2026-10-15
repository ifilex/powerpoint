import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  MoreVertical,
  Layers,
} from 'lucide-react';
import { Slide, CollaborationUser, SlideLayout } from '../../types/presentation';

interface SlideThumbnailListProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  onToggleHideSlide: (index: number) => void;
  activeUsers: CollaborationUser[];
  isDarkMode: boolean;
}

export const SlideThumbnailList: React.FC<SlideThumbnailListProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onToggleHideSlide,
  activeUsers,
  isDarkMode,
}) => {
  const [contextMenuIndex, setContextMenuIndex] = useState<number | null>(null);

  // Group collaborators per slide
  const getCollabsForSlide = (slideId: string) => {
    return activeUsers.filter((u) => u.currentSlideId === slideId);
  };

  return (
    <aside
      id="slide-thumbnail-sidebar"
      className={`w-52 flex flex-col border-r select-none h-full transition-colors ${
        isDarkMode ? 'bg-[#18181B] border-[#27272A]' : 'bg-[#F9FAFB] border-[#E5E7EB]'
      }`}
    >
      {/* Top Header */}
      <div className="px-3 py-2 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-orange-500" />
          <span>Diapositivas ({slides.length})</span>
        </div>
        <button
          id="sidebar-add-slide-btn"
          onClick={() => onAddSlide('titleAndContent')}
          className="p-1 rounded hover:bg-orange-500/20 text-orange-500 transition cursor-pointer"
          title="Agregar nueva diapositiva (Ctrl+M)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const collabs = getCollabsForSlide(slide.id);

          return (
            <div
              key={slide.id}
              className="relative group flex items-start gap-2"
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenuIndex(index);
              }}
            >
              {/* Slide Number */}
              <span
                className={`text-[11px] font-mono font-medium pt-1 w-4 text-right ${
                  isActive
                    ? 'text-orange-500 font-bold'
                    : isDarkMode
                    ? 'text-zinc-500'
                    : 'text-zinc-400'
                }`}
              >
                {index + 1}
              </span>

              {/* Thumbnail Card (16:9 Aspect Ratio) */}
              <div
                id={`slide-thumb-${index}`}
                onClick={() => onSelectSlide(index)}
                className={`flex-1 relative aspect-video rounded-md overflow-hidden border-2 transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'border-orange-500 ring-2 ring-orange-500/30'
                    : isDarkMode
                    ? 'border-zinc-700 hover:border-zinc-500'
                    : 'border-zinc-300 hover:border-zinc-400'
                } ${slide.hidden ? 'opacity-40' : ''}`}
                style={{ backgroundColor: slide.background?.color || '#FFFFFF' }}
              >
                {/* Scaled miniature content render */}
                <div
                  className="w-[960px] h-[540px] origin-top-left absolute top-0 left-0 pointer-events-none"
                  style={{
                    transform: 'scale(0.18)',
                  }}
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
                            textAlign: el.textAlign || 'left',
                            lineHeight: 1.2,
                          }}
                        >
                          {el.content}
                        </p>
                      )}
                      {el.type === 'image' && el.src && (
                        <img
                          src={el.src}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      )}
                      {el.type === 'chart' && (
                        <div className="w-full h-full bg-orange-500/10 border border-orange-500/30 rounded flex items-center justify-center font-bold text-xs text-orange-600">
                          📊 Gráfico
                        </div>
                      )}
                      {el.type === 'smartArt' && (
                        <div className="w-full h-full bg-indigo-500/10 border border-indigo-500/30 rounded flex items-center justify-center font-bold text-xs text-indigo-600">
                          ⚡ Diagrama
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Hidden Indicator */}
                {slide.hidden && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <EyeOff className="w-4 h-4" />
                  </div>
                )}

                {/* Co-author badges on this slide */}
                {collabs.length > 0 && (
                  <div className="absolute top-1 right-1 flex -space-x-1">
                    {collabs.map((user) => (
                      <img
                        key={user.id}
                        src={user.avatar}
                        alt={user.name}
                        title={`${user.name} está aquí`}
                        className="w-4 h-4 rounded-full border border-white shadow-xs"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Hover Trigger */}
              <div className="opacity-0 group-hover:opacity-100 transition flex flex-col gap-0.5 self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index > 0) onMoveSlide(index, index - 1);
                  }}
                  disabled={index === 0}
                  className="p-0.5 rounded hover:bg-zinc-500/20 disabled:opacity-20 cursor-pointer"
                  title="Mover arriba"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index < slides.length - 1) onMoveSlide(index, index + 1);
                  }}
                  disabled={index === slides.length - 1}
                  className="p-0.5 rounded hover:bg-zinc-500/20 disabled:opacity-20 cursor-pointer"
                  title="Mover abajo"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Context Menu Modal */}
              {contextMenuIndex === index && (
                <div
                  className={`fixed z-50 w-48 rounded-lg shadow-2xl border p-1 text-xs ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                  style={{ top: '35%', left: '160px' }}
                  onMouseLeave={() => setContextMenuIndex(null)}
                >
                  <button
                    onClick={() => {
                      onDuplicateSlide(index);
                      setContextMenuIndex(null);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-orange-500/10 hover:text-orange-500 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicar Diapositiva</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleHideSlide(index);
                      setContextMenuIndex(null);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-orange-500/10 hover:text-orange-500 flex items-center gap-2"
                  >
                    {slide.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{slide.hidden ? 'Mostrar Diapositiva' : 'Ocultar Diapositiva'}</span>
                  </button>

                  <div className="h-[1px] bg-zinc-500/20 my-1" />

                  <button
                    onClick={() => {
                      onDeleteSlide(index);
                      setContextMenuIndex(null);
                    }}
                    disabled={slides.length <= 1}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-red-500/10 text-red-500 flex items-center gap-2 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Diapositiva</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
