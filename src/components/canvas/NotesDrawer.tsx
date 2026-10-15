import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Slide } from '../../types/presentation';

interface NotesDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  slide: Slide;
  onUpdateNotes: (notes: string) => void;
  isDarkMode: boolean;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onToggle,
  slide,
  onUpdateNotes,
  isDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="speaker-notes-drawer"
      className={`border-t select-none transition-all flex flex-col ${
        isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-200' : 'bg-[#FAFAFA] border-[#E5E7EB] text-zinc-800'
      }`}
      style={{ height: '140px' }}
    >
      {/* Drawer Header */}
      <div className="px-4 py-1.5 border-b border-inherit flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-orange-500" />
          <span>Notas del Orador • Diapositiva {slide.slideNumber}</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-zinc-500/20 cursor-pointer"
          title="Ocultar notas"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notes Textarea */}
      <div className="flex-1 p-3">
        <textarea
          id="slide-speaker-notes-input"
          value={slide.notes || ''}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Escriba aquí las notas del orador que se mostrarán en la Vista de Moderador..."
          className="w-full h-full bg-transparent resize-none outline-none text-xs leading-relaxed font-sans placeholder:text-zinc-400"
        />
      </div>
    </div>
  );
};
