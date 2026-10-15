import React, { useState } from 'react';
import {
  ArrowLeft,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Printer,
  Cloud,
  HardDrive,
  Sparkles,
  FileText,
  FileCode,
  Globe,
  Clock,
  Trash2,
} from 'lucide-react';
import { Presentation, SlideLayout } from '../../types/presentation';
import { GoogleDriveAuthState } from '../../services/googleDriveService';

interface BackstageViewProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  presentation: Presentation;
  onNewPresentation: (templateId?: string) => void;
  onOpenFromFile: (file: File) => void;
  onOpenDriveDialog: () => void;
  onSaveLocal: () => void;
  onSaveDrive: () => void;
  onOpenExportDialog: () => void;
  driveAuth: GoogleDriveAuthState;
}

export const BackstageView: React.FC<BackstageViewProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  presentation,
  onNewPresentation,
  onOpenFromFile,
  onOpenDriveDialog,
  onSaveLocal,
  onSaveDrive,
  onOpenExportDialog,
  driveAuth,
}) => {
  const [activeBackstageTab, setActiveBackstageTab] = useState<'info' | 'new' | 'open' | 'save' | 'export'>('new');

  if (!isOpen) return null;

  const templates = [
    {
      id: 'blank',
      title: 'Presentación en Blanco',
      desc: 'Comienza con un lienzo limpio de formato 16:9.',
      color: 'bg-white text-zinc-900 border-zinc-300',
    },
    {
      id: 'executive-dark',
      title: 'Obsidian Ejecutivo',
      desc: 'Diseño moderno oscuro de alto impacto para negocios y tecnología.',
      color: 'bg-slate-900 text-white border-slate-700',
    },
    {
      id: 'corporate-pitch',
      title: 'Pitch Deck Inversionistas',
      desc: 'Estructura probada para captación de capital y métricas de crecimiento.',
      color: 'bg-blue-950 text-blue-100 border-blue-800',
    },
    {
      id: 'emerald-growth',
      title: 'Sostenibilidad e Impacto',
      desc: 'Paleta fresca para informes de impacto ecológico y finanzas.',
      color: 'bg-emerald-950 text-emerald-100 border-emerald-800',
    },
  ];

  return (
    <div
      id="office-backstage-view"
      className={`fixed inset-0 z-50 flex flex-col md:flex-row select-none animate-in fade-in duration-200 ${
        isDarkMode ? 'bg-[#18181B] text-zinc-100' : 'bg-white text-zinc-900'
      }`}
    >
      {/* Left Backstage Navigation Rail */}
      <div
        className={`w-full md:w-64 flex flex-col justify-between border-r ${
          isDarkMode ? 'bg-[#1F1F23] border-[#2E2E33]' : 'bg-[#C43E1C] text-white border-[#B03718]'
        }`}
      >
        <div>
          {/* Back to Editor Button */}
          <button
            id="backstage-back-btn"
            onClick={onClose}
            className={`w-full px-5 py-4 flex items-center gap-3 font-semibold text-sm transition-colors cursor-pointer border-b ${
              isDarkMode ? 'hover:bg-zinc-800 border-zinc-800 text-orange-400' : 'hover:bg-black/10 border-white/10 text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Regresar al Editor</span>
          </button>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-sm font-medium">
            <button
              onClick={() => setActiveBackstageTab('new')}
              className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition cursor-pointer ${
                activeBackstageTab === 'new'
                  ? isDarkMode
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'bg-white text-[#C43E1C] font-bold shadow-md'
                  : 'hover:bg-white/10 opacity-90'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>Nuevo</span>
            </button>

            <button
              onClick={() => setActiveBackstageTab('open')}
              className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition cursor-pointer ${
                activeBackstageTab === 'open'
                  ? isDarkMode
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'bg-white text-[#C43E1C] font-bold shadow-md'
                  : 'hover:bg-white/10 opacity-90'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Abrir (.pptx, .potx, .pptm, .pdf)</span>
            </button>

            <button
              onClick={() => setActiveBackstageTab('info')}
              className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition cursor-pointer ${
                activeBackstageTab === 'info'
                  ? isDarkMode
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'bg-white text-[#C43E1C] font-bold shadow-md'
                  : 'hover:bg-white/10 opacity-90'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Información</span>
            </button>

            <button
              onClick={() => setActiveBackstageTab('save')}
              className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition cursor-pointer ${
                activeBackstageTab === 'save'
                  ? isDarkMode
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'bg-white text-[#C43E1C] font-bold shadow-md'
                  : 'hover:bg-white/10 opacity-90'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>

            <button
              onClick={() => setActiveBackstageTab('export')}
              className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-3 transition cursor-pointer ${
                activeBackstageTab === 'export'
                  ? isDarkMode
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'bg-white text-[#C43E1C] font-bold shadow-md'
                  : 'hover:bg-white/10 opacity-90'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Exportar (PDF, HTML5, PPTX)</span>
            </button>
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 text-xs opacity-75 border-t border-inherit/20">
          <p className="font-semibold">Microsoft PowerPoint Web Suite</p>
          <p className="text-[10px] mt-0.5">Versión 2026.8 • Cloud & Office Script</p>
        </div>
      </div>

      {/* Right Main Backstage Content View */}
      <div className="flex-1 p-8 overflow-y-auto max-w-5xl">
        {/* ================= TAB: NUEVO ================= */}
        {activeBackstageTab === 'new' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Crear Nueva Presentación</h2>
            <p className="text-sm opacity-70 mb-6">
              Selecciona una plantilla profesional prediseñada o inicia un documento limpio compatible con OpenXML.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    onNewPresentation(tpl.id);
                    onClose();
                  }}
                  className={`p-5 rounded-xl border text-left transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer ${tpl.color}`}
                >
                  <div className="aspect-video rounded-lg bg-black/10 flex items-center justify-center mb-4 border border-white/20">
                    <Sparkles className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="font-bold text-base mb-1">{tpl.title}</h3>
                  <p className="text-xs opacity-80 leading-relaxed">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: ABRIR ================= */}
        {activeBackstageTab === 'open' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Abrir Presentación</h2>
            <p className="text-sm opacity-70 mb-6">
              Soporte nativo completo para presentaciones de PowerPoint, plantillas, macros y documentos PDF.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Local File Picker */}
              <div
                className={`p-6 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center mb-4">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Examinar desde este Equipo</h3>
                  <p className="text-xs opacity-75 leading-relaxed mb-4">
                    Abre archivos <strong>.pptx</strong>, <strong>.potx</strong> (plantillas),{' '}
                    <strong>.pptm</strong> (macros) o <strong>.pdf</strong> almacenados en tu disco local.
                  </p>
                </div>

                <label className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md">
                  <FolderOpen className="w-4 h-4" />
                  <span>Seleccionar Archivo</span>
                  <input
                    type="file"
                    accept=".pptx,.potx,.pptm,.pdf,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onOpenFromFile(file);
                        onClose();
                      }
                    }}
                  />
                </label>
              </div>

              {/* Google Drive Picker */}
              <div
                className={`p-6 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center mb-4">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Google Drive</h3>
                  <p className="text-xs opacity-75 leading-relaxed mb-4">
                    Conecta con tu cuenta de Google Workspace para explorar y sincronizar tus diapositivas en la nube.
                  </p>
                  {driveAuth.isConnected && (
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2 mb-4">
                      <span>✓ Conectado como: {driveAuth.userEmail || driveAuth.userName}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onOpenDriveDialog();
                    onClose();
                  }}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{driveAuth.isConnected ? 'Abrir desde Google Drive' : 'Conectar Google Drive'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: INFORMACIÓN ================= */}
        {activeBackstageTab === 'info' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Propiedades de la Presentación</h2>
            <div
              className={`p-6 rounded-xl border mt-4 space-y-4 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold block">Título</span>
                  <span className="font-semibold">{presentation.title}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold block">Diapositivas</span>
                  <span className="font-semibold">{presentation.slides.length} diapositivas</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold block">Formato Nativo</span>
                  <span className="font-semibold uppercase">.{presentation.fileFormat}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold block">Aspect Ratio</span>
                  <span className="font-semibold">{presentation.aspectRatio} (Pantalla Panorámica)</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold block">Macros Registrados</span>
                  <span className="font-semibold">{presentation.macros.length} scripts</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold block">Última Modificación</span>
                  <span className="font-semibold">{new Date(presentation.updatedAt).toLocaleString('es-ES')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: GUARDAR ================= */}
        {activeBackstageTab === 'save' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Guardar Presentación</h2>
            <p className="text-sm opacity-70 mb-6">
              Guarda tus cambios localmente en el navegador, en disco o sincroniza con Google Drive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  onSaveLocal();
                  onClose();
                }}
                className={`p-6 rounded-xl border text-left transition hover:border-orange-500 cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <HardDrive className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-bold text-base mb-1">Guardar Localmente</h3>
                <p className="text-xs opacity-75">
                  Guarda la revisión actual de forma persistente en el almacenamiento local de tu navegador.
                </p>
              </button>

              <button
                onClick={() => {
                  onSaveDrive();
                  onClose();
                }}
                className={`p-6 rounded-xl border text-left transition hover:border-blue-500 cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <Cloud className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-bold text-base mb-1">Guardar en Google Drive</h3>
                <p className="text-xs opacity-75">
                  Sincroniza y crea una copia en tu cuenta de Google Drive para acceso multidispositivo.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB: EXPORTAR ================= */}
        {activeBackstageTab === 'export' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Exportar Documento</h2>
            <p className="text-sm opacity-70 mb-6">
              Exporta tu mazo a múltiples formatos estándar para compartir, presentar o imprimir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                onClick={() => {
                  onOpenExportDialog();
                  onClose();
                }}
                className={`p-5 rounded-xl border text-left hover:border-orange-500 transition cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <FileText className="w-7 h-7 text-orange-500 mb-2" />
                <h3 className="font-bold text-sm">Presentación .PPTX / .POTX</h3>
                <p className="text-[11px] opacity-75 mt-1">
                  Archivo estándar compatible con Microsoft PowerPoint 2016-2024 y Office 365.
                </p>
              </button>

              <button
                onClick={() => {
                  onOpenExportDialog();
                  onClose();
                }}
                className={`p-5 rounded-xl border text-left hover:border-red-500 transition cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <Download className="w-7 h-7 text-red-500 mb-2" />
                <h3 className="font-bold text-sm">Documento PDF Vectorial</h3>
                <p className="text-[11px] opacity-75 mt-1">
                  Exportación HD nítida multipágina con opción de incluir notas del orador.
                </p>
              </button>

              <button
                onClick={() => {
                  onOpenExportDialog();
                  onClose();
                }}
                className={`p-5 rounded-xl border text-left hover:border-emerald-500 transition cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <Globe className="w-7 h-7 text-emerald-500 mb-2" />
                <h3 className="font-bold text-sm">Paquete Web HTML5</h3>
                <p className="text-[11px] opacity-75 mt-1">
                  Presentación web interactiva autónoma offline con transiciones y puntero láser.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
