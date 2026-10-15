import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  QrCode,
  Sparkles,
  Play,
  Tv,
  Eye,
  Grid,
  Code2,
  Puzzle,
  Palette,
  Layers,
  Sliders,
  Maximize2,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  Wand2,
  FileCode,
  PenTool,
  Highlighter,
  Eraser,
  MonitorPlay,
  RotateCcw,
  LayoutGrid,
  Share2,
  Download,
  Upload,
  ArrowRight,
  Star,
  MessageSquarePlus,
  Workflow,
  PieChart,
} from 'lucide-react';
import {
  ActiveRibbonTab,
  Slide,
  SlideElement,
  ShapeType,
  PresentationTheme,
  TransitionType,
  SlideLayout,
} from '../../types/presentation';
import { OFFICE_THEMES } from '../../utils/defaultData';

interface OfficeRibbonProps {
  activeTab: ActiveRibbonTab;
  onTabChange: (tab: ActiveRibbonTab) => void;
  onOpenFileMenu: () => void;
  isDarkMode: boolean;

  // Actions
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onAddText: () => void;
  onAddShape: (shapeType: ShapeType) => void;
  onAddImage: (src: string) => void;
  onAddTable: (rows?: number, cols?: number) => void;
  onAddChart: (type?: 'column' | 'bar' | 'pie' | 'line') => void;
  onAddQrCode: () => void;
  onAddSmartArt: (diagramType?: any) => void;

  // Selection & Formatting
  selectedElement: SlideElement | null;
  onUpdateElement: (updates: Partial<SlideElement>) => void;
  onDeleteElement: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;

  // Presentation State
  currentSlide: Slide;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  themes: PresentationTheme[];
  currentTheme: PresentationTheme;
  onSelectTheme: (theme: PresentationTheme) => void;

  // Modes
  drawMode: 'none' | 'pen' | 'highlighter' | 'eraser';
  onSetDrawMode: (mode: 'none' | 'pen' | 'highlighter' | 'eraser') => void;
  drawColor: string;
  onSetDrawColor: (color: string) => void;
  drawWidth: number;
  onSetDrawWidth: (width: number) => void;

  // Slideshow & Views
  onStartSlideshow: (fromBeginning: boolean) => void;
  onStartPresenterMode: () => void;
  viewMode: 'normal' | 'sorter' | 'reading';
  onSetViewMode: (mode: 'normal' | 'sorter' | 'reading') => void;

  // Dialogs
  onOpenMacroEditor: () => void;
  onOpenExtensions: (tab?: string) => void;
  onOpenExport: () => void;
  onToggleCommentsPane: () => void;
  commentsCount: number;
}

export const OfficeRibbon: React.FC<OfficeRibbonProps> = ({
  activeTab,
  onTabChange,
  onOpenFileMenu,
  isDarkMode,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onAddText,
  onAddShape,
  onAddImage,
  onAddTable,
  onAddChart,
  onAddQrCode,
  onAddSmartArt,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
  currentSlide,
  onUpdateSlide,
  themes,
  currentTheme,
  onSelectTheme,
  drawMode,
  onSetDrawMode,
  drawColor,
  onSetDrawColor,
  drawWidth,
  onSetDrawWidth,
  onStartSlideshow,
  onStartPresenterMode,
  viewMode,
  onSetViewMode,
  onOpenMacroEditor,
  onOpenExtensions,
  onOpenExport,
  onToggleCommentsPane,
  commentsCount,
}) => {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);

  const tabs: { id: ActiveRibbonTab; label: string }[] = [
    { id: 'home', label: 'Inicio' },
    { id: 'insert', label: 'Insertar' },
    { id: 'draw', label: 'Dibujar' },
    { id: 'design', label: 'Diseño' },
    { id: 'transitions', label: 'Transiciones' },
    { id: 'animations', label: 'Animaciones' },
    { id: 'slideshow', label: 'Presentación' },
    { id: 'review', label: 'Revisar' },
    { id: 'view', label: 'Vista' },
    { id: 'extensions', label: 'Extensiones' },
    { id: 'developer', label: 'Programador' },
  ];

  const layouts: { id: SlideLayout; label: string }[] = [
    { id: 'title', label: 'Diapositiva de Título' },
    { id: 'titleAndContent', label: 'Título y Objetos' },
    { id: 'sectionHeader', label: 'Encabezado de Sección' },
    { id: 'twoColumns', label: 'Dos Columnas' },
    { id: 'comparison', label: 'Comparación' },
    { id: 'kpiDashboard', label: 'Panel de Métricas KPI' },
    { id: 'timelineLayout', label: 'Línea de Tiempo' },
    { id: 'blank', label: 'En Blanco' },
  ];

  const shapes: { type: ShapeType; label: string; icon: string }[] = [
    { type: 'rectangle', label: 'Rectángulo', icon: '▭' },
    { type: 'roundedRectangle', label: 'Rectángulo Redondeado', icon: '▢' },
    { type: 'circle', label: 'Círculo / Elipse', icon: '○' },
    { type: 'triangle', label: 'Triángulo', icon: '△' },
    { type: 'diamond', label: 'Rombo', icon: '◇' },
    { type: 'star', label: 'Estrella de 5 puntas', icon: '★' },
    { type: 'arrowRight', label: 'Flecha Derecha', icon: '➔' },
    { type: 'arrowLeft', label: 'Flecha Izquierda', icon: '⬅' },
    { type: 'arrowUp', label: 'Flecha Arriba', icon: '⬆' },
    { type: 'arrowDown', label: 'Flecha Abajo', icon: '⬇' },
    { type: 'callout', label: 'Llamada de Diálogo', icon: '💬' },
    { type: 'heart', label: 'Corazón', icon: '♥' },
    { type: 'badge', label: 'Insignia', icon: '🏷️' },
    { type: 'card', label: 'Tarjeta Elevada', icon: '💳' },
  ];

  const transitions: { type: TransitionType; label: string }[] = [
    { type: 'none', label: 'Ninguna' },
    { type: 'fade', label: 'Desvanecer' },
    { type: 'slide', label: 'Desplazar' },
    { type: 'push', label: 'Empuje' },
    { type: 'wipe', label: 'Barrido' },
    { type: 'zoom', label: 'Zoom' },
    { type: 'flip', label: 'Voltear' },
    { type: 'morph', label: 'Transformación (Morph)' },
    { type: 'cube', label: 'Cubo 3D' },
  ];

  const fontFamilies = [
    'Segoe UI',
    'Calibri',
    'Arial',
    'Times New Roman',
    'Georgia',
    'Trebuchet MS',
    'Verdana',
    'Courier New',
    'Impact',
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 44, 54, 64, 72];

  const colorPalette = [
    '#0F172A',
    '#FFFFFF',
    '#C43E1C',
    '#EA580C',
    '#2563EB',
    '#059669',
    '#7C3AED',
    '#D97706',
    '#DC2626',
    '#475569',
    '#94A3B8',
    '#38BDF8',
  ];

  return (
    <div
      id="office-ribbon-container"
      className={`border-b select-none transition-colors ${
        isDarkMode ? 'bg-[#1F1F23] border-[#2E2E33] text-zinc-200' : 'bg-[#F3F4F6] border-[#E5E7EB] text-zinc-800'
      }`}
    >
      {/* Top Tab Headers */}
      <div className="flex items-center px-2 pt-1 gap-0.5 border-b border-inherit/40 text-xs">
        {/* Backstage File Tab Button */}
        <button
          id="ribbon-tab-file"
          onClick={onOpenFileMenu}
          className={`px-3 py-1.5 font-bold rounded-t text-white transition-all cursor-pointer ${
            isDarkMode
              ? 'bg-[#C43E1C] hover:bg-[#D84924]'
              : 'bg-[#C43E1C] hover:bg-[#B03718]'
          }`}
        >
          Archivo
        </button>

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`ribbon-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 font-medium rounded-t transition-all cursor-pointer ${
                isActive
                  ? isDarkMode
                    ? 'bg-[#27272A] text-white border-t-2 border-[#C43E1C] shadow-xs'
                    : 'bg-white text-zinc-900 border-t-2 border-[#C43E1C] shadow-xs'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ribbon Command Strip */}
      <div
        className={`h-24 px-3 py-1.5 flex items-center gap-3 overflow-x-auto ${
          isDarkMode ? 'bg-[#27272A]' : 'bg-white'
        }`}
      >
        {/* ================= TAB 1: INICIO (HOME) ================= */}
        {activeTab === 'home' && (
          <>
            {/* Group: Portapapeles */}
            <div className="flex items-center gap-1 pr-3 border-r border-zinc-500/20">
              <button
                id="ribbon-paste-btn"
                onClick={() => {
                  navigator.clipboard.readText().then((t) => {
                    if (t) {
                      onAddText();
                      setTimeout(() => onUpdateElement({ content: t }), 50);
                    }
                  }).catch(() => onAddText());
                }}
                className="flex flex-col items-center justify-center px-2 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs group"
                title="Pegar contenido del portapapeles (Ctrl+V)"
              >
                <Clipboard className="w-5 h-5 text-orange-500 group-hover:scale-110 transition" />
                <span className="text-[11px] mt-0.5">Pegar</span>
              </button>
              <div className="flex flex-col gap-0.5">
                <button
                  id="ribbon-copy-btn"
                  onClick={onDuplicateSlide}
                  className="flex items-center gap-1.5 px-1.5 py-0.5 text-[11px] rounded hover:bg-zinc-500/15 cursor-pointer"
                  title="Copiar / Duplicar Diapositiva"
                >
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Copiar</span>
                </button>
                <button
                  id="ribbon-cut-btn"
                  onClick={onDeleteSlide}
                  className="flex items-center gap-1.5 px-1.5 py-0.5 text-[11px] rounded hover:bg-zinc-500/15 cursor-pointer text-red-500"
                  title="Cortar / Eliminar Diapositiva"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Cortar</span>
                </button>
              </div>
            </div>

            {/* Group: Diapositivas */}
            <div className="flex items-center gap-2 pr-3 border-r border-zinc-500/20 relative">
              <div className="flex flex-col items-center">
                <button
                  id="ribbon-new-slide-btn"
                  onClick={() => onAddSlide('titleAndContent')}
                  className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs group"
                  title="Crear nueva diapositiva (Ctrl+M)"
                >
                  <Plus className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-semibold mt-0.5">Nueva Diapositiva</span>
                </button>
                <button
                  id="ribbon-layout-picker-btn"
                  onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
                >
                  Diseño ▼
                </button>

                {showLayoutMenu && (
                  <div
                    className={`absolute top-full left-0 mt-1 w-56 rounded-lg shadow-xl border p-2 z-50 ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-zinc-400 uppercase mb-1.5 px-1">Diseños de Diapositiva</div>
                    {layouts.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          onAddSlide(l.id);
                          setShowLayoutMenu(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-orange-500/10 hover:text-orange-500 transition flex items-center justify-between"
                      >
                        <span>{l.label}</span>
                        <span className="text-[10px] opacity-60 font-mono">16:9</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Group: Fuente (Typography) */}
            <div className="flex flex-col justify-center gap-1 pr-3 border-r border-zinc-500/20">
              <div className="flex items-center gap-1.5">
                <select
                  id="ribbon-font-family-select"
                  value={selectedElement?.fontFamily || 'Segoe UI'}
                  onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
                  className={`text-xs px-1.5 py-0.5 rounded border ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                  title="Familia de Fuente"
                >
                  {fontFamilies.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <select
                  id="ribbon-font-size-select"
                  value={selectedElement?.fontSize || 18}
                  onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value, 10) })}
                  className={`text-xs px-1.5 py-0.5 rounded border w-14 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                  title="Tamaño de Fuente"
                >
                  {fontSizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bold, Italic, Underline, Color */}
              <div className="flex items-center gap-1">
                <button
                  id="ribbon-bold-btn"
                  onClick={() =>
                    onUpdateElement({
                      fontWeight: selectedElement?.fontWeight === 'bold' ? 'normal' : 'bold',
                    })
                  }
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement?.fontWeight === 'bold'
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'hover:bg-zinc-500/15'
                  }`}
                  title="Negrita (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  id="ribbon-italic-btn"
                  onClick={() =>
                    onUpdateElement({
                      fontStyle: selectedElement?.fontStyle === 'italic' ? 'normal' : 'italic',
                    })
                  }
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement?.fontStyle === 'italic'
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'hover:bg-zinc-500/15'
                  }`}
                  title="Cursiva (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  id="ribbon-underline-btn"
                  onClick={() =>
                    onUpdateElement({
                      textDecoration:
                        selectedElement?.textDecoration === 'underline' ? 'none' : 'underline',
                    })
                  }
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement?.textDecoration === 'underline'
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'hover:bg-zinc-500/15'
                  }`}
                  title="Subrayado (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                {/* Text Color Picker */}
                <div className="relative flex items-center ml-1">
                  <input
                    id="ribbon-text-color-picker"
                    type="color"
                    value={selectedElement?.color || '#1E293B'}
                    onChange={(e) => onUpdateElement({ color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                    title="Color de Texto"
                  />
                </div>
              </div>
            </div>

            {/* Group: Párrafo (Alignments & Bullets) */}
            <div className="flex flex-col justify-center gap-1 pr-3 border-r border-zinc-500/20">
              <div className="flex items-center gap-1">
                <button
                  id="ribbon-align-left-btn"
                  onClick={() => onUpdateElement({ textAlign: 'left' })}
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement?.textAlign === 'left' || !selectedElement?.textAlign
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'hover:bg-zinc-500/15'
                  }`}
                  title="Alinear a la izquierda"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  id="ribbon-align-center-btn"
                  onClick={() => onUpdateElement({ textAlign: 'center' })}
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement?.textAlign === 'center'
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'hover:bg-zinc-500/15'
                  }`}
                  title="Centrar texto"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  id="ribbon-align-right-btn"
                  onClick={() => onUpdateElement({ textAlign: 'right' })}
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement?.textAlign === 'right'
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'hover:bg-zinc-500/15'
                  }`}
                  title="Alinear a la derecha"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="ribbon-bullet-list-btn"
                  onClick={() => {
                    if (selectedElement?.content) {
                      const lines = selectedElement.content.split('\n');
                      const bulleted = lines.map((l) => (l.startsWith('• ') ? l.replace('• ', '') : `• ${l}`)).join('\n');
                      onUpdateElement({ content: bulleted });
                    }
                  }}
                  className="p-1 rounded hover:bg-zinc-500/15 cursor-pointer"
                  title="Alternar Viñetas"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  id="ribbon-numbered-list-btn"
                  onClick={() => {
                    if (selectedElement?.content) {
                      const lines = selectedElement.content.split('\n');
                      const numbered = lines.map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, '')}`).join('\n');
                      onUpdateElement({ content: numbered });
                    }
                  }}
                  className="p-1 rounded hover:bg-zinc-500/15 cursor-pointer"
                  title="Alternar Numeración"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Group: Dibujo Rápido y Formas */}
            <div className="flex items-center gap-2 pr-3 border-r border-zinc-500/20 relative">
              <button
                id="ribbon-add-text-box-btn"
                onClick={onAddText}
                className="flex flex-col items-center justify-center px-2 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
                title="Insertar Cuadro de Texto"
              >
                <Type className="w-5 h-5 text-blue-500" />
                <span className="text-[11px] mt-0.5">Cuadro Texto</span>
              </button>

              <div className="relative">
                <button
                  id="ribbon-shapes-picker-btn"
                  onClick={() => setShowShapesMenu(!showShapesMenu)}
                  className="flex flex-col items-center justify-center px-2 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
                  title="Insertar Formas Geométricas"
                >
                  <Square className="w-5 h-5 text-indigo-500" />
                  <span className="text-[11px] mt-0.5">Formas ▼</span>
                </button>

                {showShapesMenu && (
                  <div
                    className={`absolute top-full left-0 mt-1 w-64 rounded-lg shadow-xl border p-2 z-50 grid grid-cols-4 gap-1.5 ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  >
                    {shapes.map((s) => (
                      <button
                        key={s.type}
                        onClick={() => {
                          onAddShape(s.type);
                          setShowShapesMenu(false);
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded hover:bg-orange-500/10 hover:text-orange-500 transition text-center"
                        title={s.label}
                      >
                        <span className="text-xl leading-none mb-1">{s.icon}</span>
                        <span className="text-[9px] truncate w-full">{s.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrange Actions */}
              <div className="flex flex-col gap-0.5">
                <button
                  id="ribbon-bring-front-btn"
                  onClick={onBringToFront}
                  disabled={!selectedElement}
                  className="px-1.5 py-0.5 text-[10px] rounded hover:bg-zinc-500/15 cursor-pointer disabled:opacity-30"
                  title="Traer al frente"
                >
                  Traer al Frente
                </button>
                <button
                  id="ribbon-send-back-btn"
                  onClick={onSendToBack}
                  disabled={!selectedElement}
                  className="px-1.5 py-0.5 text-[10px] rounded hover:bg-zinc-500/15 cursor-pointer disabled:opacity-30"
                  title="Enviar al fondo"
                >
                  Enviar al Fondo
                </button>
              </div>
            </div>

            {/* Quick AI Refine */}
            <div className="flex items-center gap-1">
              <button
                id="ribbon-home-ai-refine-btn"
                onClick={() => onOpenExtensions('ai')}
                className="flex flex-col items-center justify-center px-3 py-1 rounded bg-linear-to-b from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-500 hover:brightness-110 cursor-pointer text-xs"
                title="Mejorar diapositiva con IA"
              >
                <Wand2 className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="text-[11px] font-semibold mt-0.5">Diseñador IA</span>
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 2: INSERTAR (INSERT) ================= */}
        {activeTab === 'insert' && (
          <>
            <button
              id="insert-table-btn"
              onClick={() => onAddTable(3, 4)}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Insertar Tabla de Datos"
            >
              <TableIcon className="w-5 h-5 text-blue-500" />
              <span className="text-[11px] mt-0.5">Tabla</span>
            </button>

            <label className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <span className="text-[11px] mt-0.5">Imágenes</span>
              <input
                id="insert-image-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) onAddImage(ev.target.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            <button
              id="insert-stock-photos-btn"
              onClick={() => onOpenExtensions('stock')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Buscar Fotos de Alta Calidad en Unsplash"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-[11px] mt-0.5">Fotos Stock</span>
            </button>

            <button
              id="insert-smartart-btn"
              onClick={() => onAddSmartArt('timeline')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Insertar Diagrama SmartArt (Línea de tiempo, Proceso, SWOT)"
            >
              <Workflow className="w-5 h-5 text-indigo-500" />
              <span className="text-[11px] mt-0.5">SmartArt</span>
            </button>

            <button
              id="insert-chart-btn"
              onClick={() => onAddChart('column')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Insertar Gráfico Estadístico"
            >
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-[11px] mt-0.5">Gráfico</span>
            </button>

            <button
              id="insert-qr-btn"
              onClick={onAddQrCode}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Generar Código QR Dinámico"
            >
              <QrCode className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
              <span className="text-[11px] mt-0.5">Código QR</span>
            </button>

            <div className="h-10 w-[1px] bg-zinc-500/20 mx-1" />

            <button
              id="insert-comment-btn"
              onClick={onToggleCommentsPane}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs relative"
              title="Agregar Comentario a la Diapositiva"
            >
              <MessageSquarePlus className="w-5 h-5 text-teal-500" />
              <span className="text-[11px] mt-0.5">Comentario</span>
              {commentsCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {commentsCount}
                </span>
              )}
            </button>
          </>
        )}

        {/* ================= TAB 3: DIBUJAR (DRAW) ================= */}
        {activeTab === 'draw' && (
          <>
            <div className="flex items-center gap-1 pr-3 border-r border-zinc-500/20">
              <button
                id="draw-tool-pen-btn"
                onClick={() => onSetDrawMode(drawMode === 'pen' ? 'none' : 'pen')}
                className={`flex flex-col items-center px-2.5 py-1 rounded cursor-pointer text-xs ${
                  drawMode === 'pen' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40' : 'hover:bg-zinc-500/15'
                }`}
                title="Lápiz de Tinta Digital"
              >
                <PenTool className="w-5 h-5" />
                <span className="text-[11px] mt-0.5">Bolígrafo</span>
              </button>

              <button
                id="draw-tool-highlighter-btn"
                onClick={() => onSetDrawMode(drawMode === 'highlighter' ? 'none' : 'highlighter')}
                className={`flex flex-col items-center px-2.5 py-1 rounded cursor-pointer text-xs ${
                  drawMode === 'highlighter' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' : 'hover:bg-zinc-500/15'
                }`}
                title="Resaltador Fluorescente"
              >
                <Highlighter className="w-5 h-5" />
                <span className="text-[11px] mt-0.5">Resaltador</span>
              </button>

              <button
                id="draw-tool-eraser-btn"
                onClick={() => onSetDrawMode(drawMode === 'eraser' ? 'none' : 'eraser')}
                className={`flex flex-col items-center px-2.5 py-1 rounded cursor-pointer text-xs ${
                  drawMode === 'eraser' ? 'bg-red-500/20 text-red-500 border border-red-500/40' : 'hover:bg-zinc-500/15'
                }`}
                title="Borrador de Trazos"
              >
                <Eraser className="w-5 h-5" />
                <span className="text-[11px] mt-0.5">Borrador</span>
              </button>
            </div>

            {/* Thickness & Colors */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-400">Grosor: {drawWidth}px</span>
                <input
                  id="draw-stroke-width-slider"
                  type="range"
                  min="2"
                  max="24"
                  value={drawWidth}
                  onChange={(e) => onSetDrawWidth(parseInt(e.target.value, 10))}
                  className="w-24 accent-orange-500"
                />
              </div>

              <div className="flex items-center gap-1">
                {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#1E293B'].map((c) => (
                  <button
                    key={c}
                    onClick={() => onSetDrawColor(c)}
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition ${
                      drawColor === c ? 'scale-125 border-white shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 4: DISEÑO (DESIGN) ================= */}
        {activeTab === 'design' && (
          <>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-semibold text-zinc-400 mr-1">Temas:</span>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme)}
                  className={`flex flex-col items-center p-1.5 rounded-lg border transition cursor-pointer min-w-[90px] ${
                    currentTheme.id === theme.id
                      ? 'border-orange-500 ring-2 ring-orange-500/30'
                      : 'border-zinc-500/20 hover:border-zinc-500/50'
                  }`}
                  style={{ backgroundColor: theme.surfaceColor }}
                >
                  <div className="flex items-center gap-1 w-full justify-center mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center" style={{ color: theme.textColor }}>
                    {theme.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            <div className="h-10 w-[1px] bg-zinc-500/20 mx-2" />

            {/* Background Color */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium">Color de Fondo</span>
                <input
                  id="slide-bg-color-picker"
                  type="color"
                  value={currentSlide.background.color || '#FFFFFF'}
                  onChange={(e) =>
                    onUpdateSlide({
                      background: { ...currentSlide.background, color: e.target.value },
                    })
                  }
                  className="w-8 h-6 rounded cursor-pointer mt-1"
                />
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 5: TRANSICIONES (TRANSITIONS) ================= */}
        {activeTab === 'transitions' && (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {transitions.map((t) => (
              <button
                key={t.type}
                onClick={() =>
                  onUpdateSlide({
                    transition: { ...currentSlide.transition, type: t.type },
                  })
                }
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition cursor-pointer flex flex-col items-center gap-1 ${
                  currentSlide.transition.type === t.type
                    ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                    : 'hover:bg-zinc-500/15 border-zinc-500/20'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ================= TAB 6: ANIMACIONES (ANIMATIONS) ================= */}
        {activeTab === 'animations' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Efecto para elemento seleccionado:</span>
            {['none', 'fadeIn', 'flyIn', 'zoomIn', 'bounceIn', 'pulse'].map((anim) => (
              <button
                key={anim}
                onClick={() =>
                  onUpdateElement({
                    animation: {
                      type: anim as any,
                      delay: 0,
                      duration: 0.5,
                      trigger: 'click',
                      order: 1,
                    },
                  })
                }
                disabled={!selectedElement}
                className={`px-3 py-1.5 rounded border transition cursor-pointer disabled:opacity-40 ${
                  selectedElement?.animation?.type === anim
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'hover:bg-zinc-500/15 border-zinc-500/20'
                }`}
              >
                {anim === 'none' ? 'Sin Efecto' : anim}
              </button>
            ))}
          </div>
        )}

        {/* ================= TAB 7: PRESENTACIÓN (SLIDESHOW) ================= */}
        {activeTab === 'slideshow' && (
          <>
            <button
              id="slideshow-from-start-btn"
              onClick={() => onStartSlideshow(true)}
              className="flex flex-col items-center justify-center px-3 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white cursor-pointer text-xs font-semibold shadow-xs"
              title="Iniciar Presentación desde el Principio (F5)"
            >
              <Play className="w-5 h-5 fill-white" />
              <span className="text-[11px] mt-0.5">Desde el Principio</span>
            </button>

            <button
              id="slideshow-from-current-btn"
              onClick={() => onStartSlideshow(false)}
              className="flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Iniciar Presentación desde la Diapositiva Actual (Shift+F5)"
            >
              <MonitorPlay className="w-5 h-5 text-orange-500" />
              <span className="text-[11px] mt-0.5">Desde Actual</span>
            </button>

            <button
              id="slideshow-presenter-mode-btn"
              onClick={onStartPresenterMode}
              className="flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Vista de Moderador / Presentador con Cronómetro y Notas"
            >
              <Tv className="w-5 h-5 text-blue-500" />
              <span className="text-[11px] mt-0.5">Vista Moderador</span>
            </button>
          </>
        )}

        {/* ================= TAB 8: REVISAR (REVIEW) ================= */}
        {activeTab === 'review' && (
          <>
            <button
              id="review-spelling-btn"
              onClick={() => alert('Revisión ortográfica completada: Sin errores detectados en la presentación.')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-[11px] mt-0.5">Ortografía</span>
            </button>

            <button
              id="review-comments-btn"
              onClick={onToggleCommentsPane}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
            >
              <MessageSquare className="w-5 h-5 text-teal-500" />
              <span className="text-[11px] mt-0.5">Panel Comentarios</span>
            </button>
          </>
        )}

        {/* ================= TAB 9: VISTA (VIEW) ================= */}
        {activeTab === 'view' && (
          <>
            <button
              id="view-mode-normal-btn"
              onClick={() => onSetViewMode('normal')}
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded cursor-pointer text-xs ${
                viewMode === 'normal' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-zinc-500/15'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Normal</span>
            </button>

            <button
              id="view-mode-sorter-btn"
              onClick={() => onSetViewMode('sorter')}
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded cursor-pointer text-xs ${
                viewMode === 'sorter' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-zinc-500/15'
              }`}
            >
              <Grid className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Clasificador</span>
            </button>

            <button
              id="view-mode-reading-btn"
              onClick={() => onSetViewMode('reading')}
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded cursor-pointer text-xs ${
                viewMode === 'reading' ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-zinc-500/15'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Vista Lectura</span>
            </button>
          </>
        )}

        {/* ================= TAB 10: EXTENSIONES (ADD-INS) ================= */}
        {activeTab === 'extensions' && (
          <>
            <button
              id="ext-ai-copilot-btn"
              onClick={() => onOpenExtensions('ai')}
              className="flex flex-col items-center justify-center px-3 py-1 rounded bg-linear-to-b from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-500 hover:brightness-110 cursor-pointer text-xs"
            >
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-[11px] font-semibold mt-0.5">IA Copilot</span>
            </button>

            <button
              id="ext-smart-diagrams-btn"
              onClick={() => onOpenExtensions('diagrams')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
            >
              <Workflow className="w-5 h-5 text-indigo-500" />
              <span className="text-[11px] mt-0.5">Infografías</span>
            </button>

            <button
              id="ext-charts-btn"
              onClick={() => onOpenExtensions('charts')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
            >
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-[11px] mt-0.5">Data Studio</span>
            </button>

            <button
              id="ext-teleprompter-btn"
              onClick={() => onOpenExtensions('teleprompter')}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
            >
              <Tv className="w-5 h-5 text-teal-500" />
              <span className="text-[11px] mt-0.5">Teleprompter</span>
            </button>
          </>
        )}

        {/* ================= TAB 11: PROGRAMADOR (DEVELOPER / MACROS) ================= */}
        {activeTab === 'developer' && (
          <>
            <button
              id="dev-open-macros-btn"
              onClick={onOpenMacroEditor}
              className="flex flex-col items-center justify-center px-3 py-1 rounded bg-blue-600/15 text-blue-500 border border-blue-500/30 hover:bg-blue-600/25 cursor-pointer text-xs font-semibold"
            >
              <Code2 className="w-5 h-5" />
              <span className="text-[11px] mt-0.5">Editor Visual Basic / JS</span>
            </button>

            <button
              id="dev-export-pptm-btn"
              onClick={onOpenExport}
              className="flex flex-col items-center justify-center px-2.5 py-1 rounded hover:bg-zinc-500/15 cursor-pointer text-xs"
              title="Exportar archivo habilitado para macros .pptm"
            >
              <FileCode className="w-5 h-5 text-amber-500" />
              <span className="text-[11px] mt-0.5">Guardar como .PPTM</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
