import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileCode,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Presentation } from '../../types/presentation';
import { exportToPptx } from '../../utils/pptxHandler';
import { exportToPdf } from '../../utils/pdfHandler';
import { exportToHtml5 } from '../../utils/html5Exporter';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  presentation: Presentation;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  presentation,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pptx' | 'potx' | 'pptm' | 'pdf' | 'html5' | 'json'>('pptx');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setSuccessMessage(null);

    const safeTitle = (presentation.title || 'Presentacion').replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      if (selectedFormat === 'pptx' || selectedFormat === 'potx' || selectedFormat === 'pptm') {
        const blob = await exportToPptx(presentation, selectedFormat);
        downloadBlob(blob, `${safeTitle}.${selectedFormat}`);
      } else if (selectedFormat === 'pdf') {
        const blob = await exportToPdf(presentation, { includeNotes });
        downloadBlob(blob, `${safeTitle}.pdf`);
      } else if (selectedFormat === 'html5') {
        const blob = exportToHtml5(presentation);
        downloadBlob(blob, `${safeTitle}_presentacion.html`);
      } else if (selectedFormat === 'json') {
        const jsonStr = JSON.stringify(presentation, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        downloadBlob(blob, `${safeTitle}_backup.json`);
      }

      setSuccessMessage(`✓ Documento exportado con éxito en formato .${selectedFormat.toUpperCase()}`);
    } catch (e: any) {
      alert(`Error al exportar archivo: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formats = [
    {
      id: 'pptx',
      title: 'PowerPoint Presentation (.pptx)',
      desc: 'Formato estándar OpenXML compatible con Microsoft Office 365, PowerPoint 2016-2024 y Google Slides.',
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      badge: 'Estándar',
    },
    {
      id: 'potx',
      title: 'Plantilla de PowerPoint (.potx)',
      desc: 'Guarda el mazo como plantilla corporativa reutilizable con temas, fuentes y layouts maestros.',
      icon: <Layers className="w-6 h-6 text-amber-500" />,
      badge: 'Plantilla',
    },
    {
      id: 'pptm',
      title: 'Habilitada para Macros (.pptm)',
      desc: 'Incluye el flujo de macros VBA y scripts Office para ejecución automática en PowerPoint.',
      icon: <FileCode className="w-6 h-6 text-blue-500" />,
      badge: 'Macros',
    },
    {
      id: 'pdf',
      title: 'Documento PDF Vectorial (.pdf)',
      desc: 'Formato nítido de alta fidelidad para impresión y distribución digital profesional.',
      icon: <Download className="w-6 h-6 text-red-500" />,
      badge: 'Universal',
    },
    {
      id: 'html5',
      title: 'Presentación Autónoma HTML5 (.html)',
      desc: 'Paquete web interactivo offline con animaciones, transiciones, notas y puntero láser.',
      icon: <Globe className="w-6 h-6 text-emerald-500" />,
      badge: 'Interactivo',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Exportar Presentación</h2>
              <p className="text-xs opacity-70">
                Selecciona el formato de salida deseado para tu archivo.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-500/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formats Selection */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {formats.map((fmt) => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`p-4 rounded-xl border flex items-start gap-4 transition cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20'
                    : isDarkMode
                    ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-black/10 shrink-0">{fmt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm">{fmt.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-zinc-500/15 text-zinc-400">
                      {fmt.badge}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 leading-relaxed">{fmt.desc}</p>
                </div>
              </div>
            );
          })}

          {/* Options for PDF */}
          {selectedFormat === 'pdf' && (
            <div
              className={`p-3 rounded-xl border mt-2 flex items-center justify-between text-xs ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <span>Incluir páginas con Notas del Orador al final:</span>
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-inherit flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-zinc-500/20 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando archivo...' : `Exportar .${selectedFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
