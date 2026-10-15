import React, { useState, useEffect } from 'react';
import {
  Cloud,
  HardDrive,
  RefreshCw,
  FolderOpen,
  Save,
  CheckCircle,
  FileText,
  Trash2,
  ExternalLink,
  X,
  Upload,
  Sparkles,
} from 'lucide-react';
import { GoogleDriveService, DriveFileItem, GoogleDriveAuthState } from '../../services/googleDriveService';
import { Presentation } from '../../types/presentation';

interface GoogleDriveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  presentation: Presentation;
  onLoadPresentation: (pres: Presentation) => void;
  onDriveAuthChange: (auth: GoogleDriveAuthState) => void;
}

export const GoogleDriveDialog: React.FC<GoogleDriveDialogProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  presentation,
  onLoadPresentation,
  onDriveAuthChange,
}) => {
  const [authState, setAuthState] = useState<GoogleDriveAuthState>(GoogleDriveService.getAuthState());
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && authState.isConnected) {
      loadFiles();
    }
  }, [isOpen, authState.isConnected]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await GoogleDriveService.requestToken();
      const updated = GoogleDriveService.getAuthState();
      setAuthState(updated);
      onDriveAuthChange(updated);
      await loadFiles();
      setStatusMessage('¡Conectado exitosamente con Google Drive!');
    } catch (e: any) {
      setStatusMessage(`Error de conexión: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    GoogleDriveService.disconnect();
    const updated = GoogleDriveService.getAuthState();
    setAuthState(updated);
    onDriveAuthChange(updated);
    setFiles([]);
    setStatusMessage('Desconectado de Google Drive.');
  };

  const loadFiles = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const list = await GoogleDriveService.listPresentations();
      setFiles(list);
    } catch (e: any) {
      setStatusMessage(`Error cargando archivos: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDrive = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await GoogleDriveService.saveToDrive(presentation);
      setStatusMessage(`✓ Presentación guardada exitosamente en Google Drive (ID: ${res.fileId})`);
      await loadFiles();
    } catch (e: any) {
      setStatusMessage(`Error al guardar: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFile = async (file: DriveFileItem) => {
    setIsLoading(true);
    try {
      const loaded = await GoogleDriveService.loadFromDrive(file.id, file.name);
      onLoadPresentation(loaded);
      onClose();
    } catch (e: any) {
      setStatusMessage(`Error al abrir archivo: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gestor de Google Drive</h2>
              <p className="text-xs opacity-70">
                Sincroniza y abre presentaciones .pptx, .potx y .pdf directamente en la nube.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-500/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth status bar */}
        <div
          className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
            isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          {authState.isConnected ? (
            <div className="flex items-center gap-3">
              {authState.userPhoto && (
                <img
                  src={authState.userPhoto}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                />
              )}
              <div>
                <span className="font-bold text-emerald-500">Conectado: </span>
                <span>{authState.userName || authState.userEmail}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400">
              <HardDrive className="w-4 h-4" />
              <span>No hay cuenta de Google Drive vinculada actualmente.</span>
            </div>
          )}

          <div>
            {authState.isConnected ? (
              <button
                onClick={handleDisconnect}
                className="text-red-500 hover:underline cursor-pointer font-medium text-xs"
              >
                Desconectar
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Conectar con Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {statusMessage && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center justify-between">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage(null)} className="text-xs hover:underline">
                ✕
              </button>
            </div>
          )}

          {authState.isConnected && (
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Presentaciones en tu Google Drive</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadFiles}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg border hover:bg-zinc-500/15 cursor-pointer text-xs flex items-center gap-1"
                  title="Actualizar lista de archivos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refrescar</span>
                </button>
                <button
                  onClick={handleSaveToDrive}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Guardando en Drive...' : 'Guardar Presentación Actual'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Files List */}
          {authState.isConnected ? (
            isLoading ? (
              <div className="py-12 text-center text-xs opacity-60 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span>Cargando archivos desde Google Drive...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center text-xs opacity-60">
                No se encontraron presentaciones .pptx o .pdf en la carpeta principal de Drive.
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition hover:border-blue-500 ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-semibold text-xs truncate">{file.name}</h4>
                        <p className="text-[10px] opacity-60">
                          Modificado: {new Date(file.modifiedTime).toLocaleDateString('es-ES')} • {file.size || 'Nube'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenFile(file)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/15 text-blue-500 hover:bg-blue-600/25 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center">
                <Cloud className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-bold text-base mb-1">Conecta tu Google Workspace</h3>
                <p className="text-xs opacity-75 leading-relaxed">
                  Al conectar Google Drive, podrás abrir archivos directamente, guardar versiones sincronizadas y colaborar con tu equipo en la nube.
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                <span>Autorizar Acceso a Google Drive</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-inherit flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border hover:bg-zinc-500/20 text-xs font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
