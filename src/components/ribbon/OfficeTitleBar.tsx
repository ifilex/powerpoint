import React, { useState, useEffect } from 'react';
import {
  Save,
  Cloud,
  CloudCheck,
  Share2,
  Moon,
  Sun,
  Search,
  Users,
  HardDrive,
  Presentation as PresIcon,
  HelpCircle,
  Undo2,
  Redo2,
  Sparkles,
} from 'lucide-react';
import { Presentation, CollaborationUser } from '../../types/presentation';
import { GoogleDriveAuthState } from '../../services/googleDriveService';

interface OfficeTitleBarProps {
  presentation: Presentation;
  onUpdateTitle: (title: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  driveAuth: GoogleDriveAuthState;
  onOpenDrive: () => void;
  onOpenShare: () => void;
  onQuickSave: () => void;
  isSaving: boolean;
  activeUsers: CollaborationUser[];
  onOpenExtensions: (tab?: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const OfficeTitleBar: React.FC<OfficeTitleBarProps> = ({
  presentation,
  onUpdateTitle,
  isDarkMode,
  onToggleDarkMode,
  driveAuth,
  onOpenDrive,
  onOpenShare,
  onQuickSave,
  isSaving,
  activeUsers = [],
  onOpenExtensions,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const currentTitle = presentation?.title || 'Presentación sin título';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentTitle);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Keep title input synced if presentation title updates
  useEffect(() => {
    setTitleInput(presentation?.title || 'Presentación sin título');
  }, [presentation?.title]);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(presentation?.title || 'Presentación sin título');
    }
    setIsEditingTitle(false);
  };

  const getFormatBadge = () => {
    switch (presentation?.fileFormat) {
      case 'pptm':
        return { label: '.PPTM (Macros)', color: 'bg-blue-600/20 text-blue-400 border-blue-500/30' };
      case 'potx':
        return { label: '.POTX (Plantilla)', color: 'bg-amber-600/20 text-amber-400 border-amber-500/30' };
      default:
        return { label: '.PPTX', color: 'bg-orange-600/20 text-orange-400 border-orange-500/30' };
    }
  };

  const formatBadge = getFormatBadge();

  return (
    <header
      id="office-title-bar"
      className={`h-11 px-3 flex items-center justify-between select-none border-b transition-colors ${
        isDarkMode
          ? 'bg-[#18181B] border-[#27272A] text-zinc-200'
          : 'bg-[#C43E1C] border-[#B03718] text-white'
      }`}
    >
      {/* Left section: Quick Access Toolbar & App Icon */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-sm tracking-wide">
          <div className="w-6 h-6 rounded bg-white text-[#C43E1C] flex items-center justify-center shadow-xs font-black text-xs">
            P
          </div>
          <span className="hidden sm:inline font-bold">PowerPoint</span>
        </div>

        {/* Quick Access Toolbar Divider */}
        <div
          className={`h-4 w-[1px] mx-1 ${isDarkMode ? 'bg-zinc-700' : 'bg-white/30'}`}
        />

        {/* AutoSave switch */}
        <div className="flex items-center gap-1.5 bg-black/15 px-2 py-0.5 rounded text-xs">
          <span className="hidden md:inline text-[11px] opacity-90">Autoguardado</span>
          <button
            id="toggle-autosave-btn"
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`w-7 h-3.5 rounded-full transition-colors relative cursor-pointer ${
              autoSaveEnabled
                ? isDarkMode
                  ? 'bg-orange-500'
                  : 'bg-white'
                : 'bg-zinc-600'
            }`}
            title="Activar/Desactivar autoguardado"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full absolute top-0.5 transition-transform ${
                autoSaveEnabled
                  ? isDarkMode
                    ? 'translate-x-4 bg-black'
                    : 'translate-x-4 bg-[#C43E1C]'
                  : 'translate-x-0.5 bg-white'
              }`}
            />
          </button>
        </div>

        {/* Quick Save Button */}
        <button
          id="quick-save-btn"
          onClick={onQuickSave}
          disabled={isSaving}
          className={`p-1 rounded transition hover:bg-white/20 active:scale-95 ${
            isSaving ? 'animate-pulse' : ''
          }`}
          title="Guardar localmente (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        {/* Undo / Redo */}
        <button
          id="quick-undo-btn"
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1 rounded transition hover:bg-white/20 ${
            !canUndo ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
          }`}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          id="quick-redo-btn"
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1 rounded transition hover:bg-white/20 ${
            !canRedo ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
          }`}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Title and Cloud Sync status */}
      <div className="flex items-center gap-2 max-w-md w-full justify-center">
        {isEditingTitle ? (
          <input
            id="presentation-title-input"
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className={`px-2 py-0.5 text-xs font-semibold rounded outline-none border ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-600 text-white'
                : 'bg-white text-zinc-900 border-white/50'
            }`}
          />
        ) : (
          <button
            id="edit-title-btn"
            onClick={() => {
              setTitleInput(presentation?.title || 'Presentación sin título');
              setIsEditingTitle(true);
            }}
            className={`px-2 py-0.5 rounded text-xs font-semibold hover:bg-white/20 flex items-center gap-1.5 transition truncate max-w-[240px]`}
            title="Haz clic para renombrar la presentación"
          >
            <span className="truncate">{presentation?.title || 'Presentación sin título'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${formatBadge.color}`}
            >
              {formatBadge.label}
            </span>
          </button>
        )}

        {/* Google Drive / Cloud Sync Pill */}
        <button
          id="cloud-sync-status-btn"
          onClick={onOpenDrive}
          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition cursor-pointer ${
            driveAuth.isConnected
              ? isDarkMode
                ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
              : isDarkMode
              ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
              : 'bg-black/20 border-white/20 text-white/90 hover:bg-black/30'
          }`}
          title={
            driveAuth.isConnected
              ? `Sincronizado con Google Drive (${driveAuth.userEmail || 'Conectado'})`
              : 'Conectar a Google Drive para guardar y sincronizar'
          }
        >
          {driveAuth.isConnected ? (
            <>
              <Cloud className="w-3 h-3 text-emerald-400 fill-emerald-400/30" />
              <span className="hidden sm:inline">Drive Sincronizado</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3 h-3 opacity-80" />
              <span className="hidden sm:inline">Almacenamiento Local</span>
            </>
          )}
        </button>
      </div>

      {/* Right: Search, AI, Collaboration Avatars, Theme & Share */}
      <div className="flex items-center gap-2">
        {/* Search / Copilot Bar */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
            isDarkMode ? 'bg-zinc-800/80 text-zinc-300' : 'bg-black/15 text-white'
          }`}
        >
          <Search className="w-3 h-3 opacity-70" />
          <input
            id="tell-me-search-bar"
            type="text"
            placeholder="¿Qué desea hacer? (Alt+Q)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-36 placeholder:text-inherit placeholder:opacity-60"
          />
        </div>

        {/* AI Copilot Quick Trigger */}
        <button
          id="copilot-quick-btn"
          onClick={() => onOpenExtensions('ai')}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition cursor-pointer ${
            isDarkMode
              ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30 hover:brightness-110'
              : 'bg-white/25 text-white hover:bg-white/35 shadow-xs'
          }`}
          title="Abrir Copilot de IA y Asistente de Diapositivas"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
          <span className="hidden xl:inline">IA Copilot</span>
        </button>

        {/* Collaborators Live Avatars */}
        <div className="flex items-center -space-x-1.5">
          {activeUsers.slice(0, 3).map((user) => (
            <img
              key={user.id}
              src={user.avatar}
              alt={user.name}
              title={`${user.name} (${user.currentSlideId})`}
              className="w-5 h-5 rounded-full border-2 border-zinc-900 object-cover shadow-xs"
            />
          ))}
          {activeUsers.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-zinc-700 text-[10px] text-white flex items-center justify-center font-bold border-2 border-zinc-900">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          id="open-share-modal-btn"
          onClick={onOpenShare}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
            isDarkMode
              ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
              : 'bg-white text-[#C43E1C] hover:bg-zinc-100 shadow-xs'
          }`}
          title="Compartir y colaborar en tiempo real"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Compartir</span>
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          id="toggle-dark-mode-btn"
          onClick={onToggleDarkMode}
          className="p-1 rounded hover:bg-white/20 transition cursor-pointer text-inherit"
          title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro para largas jornadas'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
