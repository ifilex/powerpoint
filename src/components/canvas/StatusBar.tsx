import React from 'react';
import {
  FileText,
  MessageSquare,
  LayoutGrid,
  Grid,
  Eye,
  Play,
  Minus,
  Plus,
  Maximize,
} from 'lucide-react';
import { ActiveViewMode } from '../../types/presentation';

interface StatusBarProps {
  currentSlideIndex: number;
  totalSlides: number;
  notesOpen: boolean;
  onToggleNotes: () => void;
  commentsCount: number;
  onToggleComments: () => void;
  viewMode: ActiveViewMode;
  onSetViewMode: (mode: ActiveViewMode) => void;
  zoom: number;
  onSetZoom: (zoom: number) => void;
  onFitToWindow: () => void;
  onStartSlideshow: () => void;
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentSlideIndex,
  totalSlides,
  notesOpen,
  onToggleNotes,
  commentsCount,
  onToggleComments,
  viewMode,
  onSetViewMode,
  zoom,
  onSetZoom,
  onFitToWindow,
  onStartSlideshow,
  isDarkMode,
}) => {
  return (
    <footer
      id="office-status-bar"
      className={`h-7 px-3 flex items-center justify-between select-none border-t text-[11px] font-medium transition-colors ${
        isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-400' : 'bg-[#F3F4F6] border-[#E5E7EB] text-zinc-600'
      }`}
    >
      {/* Left info: Slide count and notes trigger */}
      <div className="flex items-center gap-3">
        <span id="status-slide-counter">
          Diapositiva {currentSlideIndex + 1} de {totalSlides}
        </span>

        <button
          id="status-notes-toggle-btn"
          onClick={onToggleNotes}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition ${
            notesOpen ? 'bg-orange-500/20 text-orange-500 font-bold' : 'hover:bg-zinc-500/15'
          }`}
          title="Mostrar/Ocultar panel de notas del orador"
        >
          <FileText className="w-3 h-3" />
          <span>Notas</span>
        </button>

        <button
          id="status-comments-toggle-btn"
          onClick={onToggleComments}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-500/15 cursor-pointer transition"
          title="Ver comentarios"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Comentarios {commentsCount > 0 ? `(${commentsCount})` : ''}</span>
        </button>
      </div>

      {/* Right controls: View modes, Zoom slider & Fit */}
      <div className="flex items-center gap-3">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-0.5 border-r border-inherit pr-2">
          <button
            id="status-view-normal-btn"
            onClick={() => onSetViewMode('normal')}
            className={`p-1 rounded cursor-pointer ${
              viewMode === 'normal' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-zinc-500/15'
            }`}
            title="Vista Normal"
          >
            <LayoutGrid className="w-3 h-3" />
          </button>

          <button
            id="status-view-sorter-btn"
            onClick={() => onSetViewMode('sorter')}
            className={`p-1 rounded cursor-pointer ${
              viewMode === 'sorter' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-zinc-500/15'
            }`}
            title="Clasificador de Diapositivas"
          >
            <Grid className="w-3 h-3" />
          </button>

          <button
            id="status-view-reading-btn"
            onClick={() => onSetViewMode('reading')}
            className={`p-1 rounded cursor-pointer ${
              viewMode === 'reading' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-zinc-500/15'
            }`}
            title="Vista de Lectura"
          >
            <Eye className="w-3 h-3" />
          </button>

          <button
            id="status-view-slideshow-btn"
            onClick={onStartSlideshow}
            className="p-1 rounded hover:bg-zinc-500/15 cursor-pointer text-orange-500"
            title="Presentación con diapositivas (F5)"
          >
            <Play className="w-3 h-3 fill-orange-500" />
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-1.5">
          <button
            id="status-zoom-out-btn"
            onClick={() => onSetZoom(Math.max(30, zoom - 10))}
            className="p-0.5 rounded hover:bg-zinc-500/15 cursor-pointer"
            title="Reducir zoom"
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            id="status-zoom-slider"
            type="range"
            min="30"
            max="180"
            value={zoom}
            onChange={(e) => onSetZoom(parseInt(e.target.value, 10))}
            className="w-16 h-1 accent-orange-500 cursor-pointer"
          />

          <button
            id="status-zoom-in-btn"
            onClick={() => onSetZoom(Math.min(180, zoom + 10))}
            className="p-0.5 rounded hover:bg-zinc-500/15 cursor-pointer"
            title="Aumentar zoom"
          >
            <Plus className="w-3 h-3" />
          </button>

          <button
            id="status-zoom-val-btn"
            onClick={onFitToWindow}
            className="w-10 text-center font-mono hover:underline cursor-pointer"
            title="Ajustar diapositiva a la ventana actual"
          >
            {zoom}%
          </button>

          <button
            id="status-fit-window-btn"
            onClick={onFitToWindow}
            className="p-1 rounded hover:bg-zinc-500/15 cursor-pointer"
            title="Ajustar a la ventana"
          >
            <Maximize className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};
