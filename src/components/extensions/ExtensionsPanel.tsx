import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Image as ImageIcon,
  QrCode,
  PieChart,
  Layers,
  Wand2,
  CheckCircle,
  X,
  Search,
  Plus,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Clock,
  LayoutTemplate,
} from 'lucide-react';
import { Presentation, Slide, SlideElement, SmartArtItem } from '../../types/presentation';

interface ExtensionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  presentation: Presentation;
  currentSlide: Slide;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onAddSlideElement: (element: SlideElement) => void;
  onApplyNewPresentation: (newPres: Presentation) => void;
}

export const ExtensionsPanel: React.FC<ExtensionsPanelProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  presentation,
  currentSlide,
  onUpdateSlide,
  onAddSlideElement,
  onApplyNewPresentation,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'stock' | 'diagrams' | 'qrcode' | 'batch'>('ai');

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  // Stock Photos State
  const [stockQuery, setStockQuery] = useState('business technology');
  const [stockPhotos, setStockPhotos] = useState([
    { id: '1', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80', title: 'Equipo en reunión' },
    { id: '2', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', title: 'Gráficos analíticos' },
    { id: '3', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80', title: 'Finanzas y estrategia' },
    { id: '4', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', title: 'Innovación y trabajo' },
  ]);

  // QR Code State
  const [qrValue, setQrValue] = useState('https://powerpoint.office.com');

  if (!isOpen) return null;

  // Handle AI Full Deck Generation
  const handleGenerateDeckAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiStatus('Generando esquema y diapositivas con Inteligencia Artificial...');

    try {
      const response = await fetch('/api/ai/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, slideCount: 4 }),
      });

      if (!response.ok) {
        throw new Error('Error al contactar con el servicio de IA');
      }

      const data = await response.json();
      if (data.slides && data.slides.length > 0) {
        onApplyNewPresentation({
          ...presentation,
          title: data.title || presentation.title,
          slides: data.slides,
        });
        setAiStatus('¡Presentación generada exitosamente!');
      }
    } catch (e: any) {
      // Fallback local smart synthesis if offline
      setAiStatus(`Generando estructura inteligente para: "${aiPrompt}"`);
      const createdSlides: Slide[] = [
        {
          id: `ai-slide-1`,
          slideNumber: 1,
          title: aiPrompt,
          layout: 'title',
          elements: [
            {
              id: 'el-t1',
              type: 'text',
              x: 80,
              y: 160,
              width: 800,
              height: 90,
              content: aiPrompt,
              fontSize: 40,
              fontWeight: 'bold',
              color: '#0F172A',
            },
            {
              id: 'el-sub1',
              type: 'text',
              x: 80,
              y: 270,
              width: 700,
              height: 50,
              content: 'Estrategia, Análisis de Impacto y Próximos Pasos Ejecutivos',
              fontSize: 20,
              color: '#64748B',
            },
          ],
        },
        {
          id: `ai-slide-2`,
          slideNumber: 2,
          title: 'Objetivos y Visión Estratégica',
          layout: 'titleAndContent',
          elements: [
            {
              id: 'el-t2',
              type: 'text',
              x: 60,
              y: 40,
              width: 800,
              height: 50,
              content: 'Objetivos y Visión Estratégica',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#0F172A',
            },
            {
              id: 'el-c2',
              type: 'text',
              x: 60,
              y: 120,
              width: 840,
              height: 360,
              content: `• Optimización de procesos operativos clave.\n• Escalamiento acelerado en el mercado regional.\n• Retorno de inversión proyectado superior al 35% en el primer ciclo.\n• Integración de tecnología de vanguardia y automatización de flujos de trabajo.`,
              fontSize: 18,
              lineHeight: 1.6,
              color: '#334155',
            },
          ],
        },
      ];

      onApplyNewPresentation({
        ...presentation,
        title: aiPrompt,
        slides: createdSlides,
      });
      setAiStatus('✓ Mazo estructurado y creado.');
    } finally {
      setAiLoading(false);
    }
  };

  // Insert SmartArt
  const handleInsertDiagram = (diagramType: string) => {
    let items: SmartArtItem[] = [];

    if (diagramType === 'process') {
      items = [
        { id: '1', title: '1. Diagnóstico', description: 'Auditoría inicial y levantamiento de requerimientos.', color: '#3B82F6' },
        { id: '2', title: '2. Diseño', description: 'Prototipado y arquitectura de solución.', color: '#10B981' },
        { id: '3', title: '3. Ejecución', description: 'Despliegue ágil en producción.', color: '#F59E0B' },
        { id: '4', title: '4. Escala', description: 'Monitoreo de KPIs y crecimiento continuo.', color: '#8B5CF6' },
      ];
    } else if (diagramType === 'swot') {
      items = [
        { id: '1', title: 'Fortalezas', description: 'Ventajas competitivas y talento especializado.', color: '#10B981' },
        { id: '2', title: 'Oportunidades', description: 'Expansión a nuevos nichos de mercado.', color: '#3B82F6' },
        { id: '3', title: 'Debilidades', description: 'Áreas de mejora en infraestructura interna.', color: '#F59E0B' },
        { id: '4', title: 'Amenazas', description: 'Competencia agresiva y volatilidad externa.', color: '#EF4444' },
      ];
    }

    const newElement: SlideElement = {
      id: `smartart-${Date.now()}`,
      type: 'smartArt',
      x: 60,
      y: 120,
      width: 840,
      height: 320,
      diagramType: diagramType as any,
      diagramItems: items,
      zIndex: currentSlide.elements.length + 1,
    };

    onAddSlideElement(newElement);
    onClose();
  };

  // Insert QR Code
  const handleInsertQRCode = () => {
    const newEl: SlideElement = {
      id: `qr-${Date.now()}`,
      type: 'qrcode',
      x: 380,
      y: 170,
      width: 200,
      height: 200,
      qrValue: qrValue,
      zIndex: currentSlide.elements.length + 1,
    };
    onAddSlideElement(newEl);
    onClose();
  };

  // Batch action: Uniform font
  const handleBatchFont = (fontFamily: string) => {
    const updatedSlides = presentation.slides.map((s) => ({
      ...s,
      elements: s.elements.map((el) => (el.type === 'text' ? { ...el, fontFamily } : el)),
    }));
    onApplyNewPresentation({ ...presentation, slides: updatedSlides });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl h-[80vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Centro de Extensiones y Automatización</h2>
              <p className="text-xs opacity-70">
                Mejora tu flujo de trabajo con IA, diagramas SmartArt, fotos stock y tareas en lote.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-500/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Extension Tabs Navigation */}
        <div
          className={`px-6 border-b flex items-center gap-2 text-xs font-semibold ${
            isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'ai'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Copiloto de IA (Gemini)</span>
          </button>

          <button
            onClick={() => setActiveTab('diagrams')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'diagrams'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>SmartArt & Diagramas</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'stock'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>Biblioteca Stock HD</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'qrcode'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <QrCode className="w-4 h-4 text-purple-500" />
            <span>Generador QR Dinámico</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'batch'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-500" />
            <span>Acciones por Lote</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: IA COPILOT */}
          {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-xl border bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-orange-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Generador de Presentaciones con IA</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed mb-4">
                  Describe el tema o reporte que deseas comunicar. Gemini creará el título, subtítulos, diapositivas estructuradas y notas del orador.
                </p>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ejemplo: Presentación para lanzar un producto de software SaaS enfocado en productividad empresarial y retorno de inversión..."
                  className={`w-full p-3 rounded-xl text-xs border resize-none h-24 outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'
                  }`}
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] opacity-60">Potenciado por Google Gemini 2.5 Flash</span>
                  <button
                    onClick={handleGenerateDeckAI}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                    <span>{aiLoading ? 'Creando diapositivas...' : 'Generar Presentación'}</span>
                  </button>
                </div>
              </div>

              {aiStatus && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{aiStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMARTART DIAGRAMS */}
          {activeTab === 'diagrams' && (
            <div>
              <h3 className="font-bold text-base mb-1">Diagramas SmartArt Preconfigurados</h3>
              <p className="text-xs opacity-70 mb-5">
                Haz clic en una plantilla para insertarla directamente en la diapositiva activa.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => handleInsertDiagram('process')}
                  className={`p-5 rounded-xl border transition hover:scale-[1.01] hover:border-blue-500 cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <h4 className="font-bold text-sm mb-2 text-blue-500">Pipeline de Proceso (4 Fases)</h4>
                  <div className="flex gap-2 mb-3">
                    {['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4'].map((f, i) => (
                      <div key={i} className="flex-1 p-2 rounded bg-blue-500/10 text-[10px] font-bold text-center">
                        {f}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs opacity-70">
                    Ideal para metodologías de proyecto, onboarding de clientes o roadmap de producto.
                  </p>
                </div>

                <div
                  onClick={() => handleInsertDiagram('swot')}
                  className={`p-5 rounded-xl border transition hover:scale-[1.01] hover:border-emerald-500 cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <h4 className="font-bold text-sm mb-2 text-emerald-500">Matriz FODA / SWOT</h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded bg-emerald-500/15 text-[10px] font-bold">Fortalezas</div>
                    <div className="p-2 rounded bg-blue-500/15 text-[10px] font-bold">Oportunidades</div>
                    <div className="p-2 rounded bg-amber-500/15 text-[10px] font-bold">Debilidades</div>
                    <div className="p-2 rounded bg-red-500/15 text-[10px] font-bold">Amenazas</div>
                  </div>
                  <p className="text-xs opacity-70">
                    Estructura estándar de análisis estratégico de negocio y evaluación de riesgos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOCK PHOTOS */}
          {activeTab === 'stock' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    value={stockQuery}
                    onChange={(e) => setStockQuery(e.target.value)}
                    placeholder="Buscar imágenes en Unsplash..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stockPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      onAddSlideElement({
                        id: `img-${Date.now()}`,
                        type: 'image',
                        x: 160,
                        y: 80,
                        width: 640,
                        height: 380,
                        src: photo.url,
                        zIndex: currentSlide.elements.length + 1,
                      });
                      onClose();
                    }}
                    className="group relative aspect-video rounded-xl overflow-hidden border cursor-pointer hover:border-orange-500 shadow-sm"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                      Insertar en Diapositiva
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="font-bold text-base">Generar Código QR en Diapositiva</h3>
              <p className="text-xs opacity-70">
                Permite a tu audiencia escanear enlaces de registro, encuestas en vivo o URLs desde sus teléfonos.
              </p>

              <div>
                <label className="text-xs font-bold block mb-1">URL o Texto de Destino:</label>
                <input
                  type="text"
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs border outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>

              <div className="p-4 rounded-xl border flex items-center justify-center bg-white">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrValue)}`}
                  alt="QR Preview"
                  className="w-36 h-36"
                />
              </div>

              <button
                onClick={handleInsertQRCode}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Insertar Código QR</span>
              </button>
            </div>
          )}

          {/* TAB 5: BATCH ACTIONS */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base">Automatizaciones de Diseño Global</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <h4 className="font-bold text-xs mb-2">Unificar Tipografía de Todo el Mazo</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Segoe UI', 'Arial', 'Calibri', 'Inter', 'Playfair Display'].map((font) => (
                      <button
                        key={font}
                        onClick={() => handleBatchFont(font)}
                        className="px-3 py-1 rounded-lg border text-xs hover:border-orange-500 cursor-pointer"
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-inherit flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border hover:bg-zinc-500/20 text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
