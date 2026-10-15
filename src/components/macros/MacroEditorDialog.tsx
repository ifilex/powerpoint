import React, { useState } from 'react';
import {
  Code,
  Play,
  Save,
  Plus,
  Terminal,
  FileCode,
  CheckCircle,
  AlertTriangle,
  X,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { MacroScript, Presentation } from '../../types/presentation';
import { MacroEngine } from '../../services/macroEngine';

interface MacroEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  presentation: Presentation;
  onUpdatePresentation: (newPres: Presentation) => void;
}

export const MacroEditorDialog: React.FC<MacroEditorDialogProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  presentation,
  onUpdatePresentation,
}) => {
  const [macros, setMacros] = useState<MacroScript[]>(presentation.macros || []);
  const [selectedMacroId, setSelectedMacroId] = useState<string>(
    presentation.macros?.[0]?.id || 'macro-1'
  );
  const [currentCode, setCurrentCode] = useState<string>(
    presentation.macros?.[0]?.code ||
      `// Office Script / VBA Automator
function main(app) {
  const slides = app.presentation.slides;
  console.log("Procesando " + slides.length + " diapositivas...");
  
  // Agregar encabezado a todas las diapositivas
  slides.forEach((slide, idx) => {
    app.addShape({
      type: 'text',
      x: 40,
      y: 20,
      width: 400,
      height: 30,
      content: "CONFIDENCIAL • " + app.presentation.title,
      fontSize: 12,
      color: "#94A3B8"
    });
  });
  
  console.log("✓ Macro ejecutado con éxito.");
}`
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const currentMacro = macros.find((m) => m.id === selectedMacroId);

  const samplePresets = [
    {
      title: 'Encabezado y Numeración',
      code: `function main(app) {
  const slides = app.presentation.slides;
  slides.forEach((slide, i) => {
    app.addShape({
      type: 'text',
      x: 820,
      y: 500,
      width: 100,
      height: 30,
      content: \`\${i + 1} / \${slides.length}\`,
      fontSize: 12,
      color: '#64748B'
    });
  });
  console.log(\`Agregada numeración a \${slides.length} diapositivas.\`);
}`,
    },
    {
      title: 'Crear Diapositiva KPI',
      code: `function main(app) {
  const newSlide = app.addSlide('titleAndContent');
  newSlide.title = 'Métricas Clave de Rendimiento';
  
  // Agregar Tarjetas de Métricas
  const kpis = [
    { title: 'MRR Anual', val: '$1.2M', growth: '+34%' },
    { title: 'NPS Score', val: '78 / 100', growth: '+12pts' },
    { title: 'Usuarios Activos', val: '45.2K', growth: '+55%' }
  ];
  
  kpis.forEach((kpi, idx) => {
    app.addShape({
      type: 'shape',
      shapeType: 'roundedRectangle',
      x: 60 + (idx * 280),
      y: 180,
      width: 260,
      height: 180,
      fill: '#1E293B',
      borderRadius: 16
    });
    
    app.addShape({
      type: 'text',
      x: 80 + (idx * 280),
      y: 200,
      width: 220,
      height: 40,
      content: kpi.title,
      fontSize: 16,
      color: '#94A3B8'
    });
    
    app.addShape({
      type: 'text',
      x: 80 + (idx * 280),
      y: 240,
      width: 220,
      height: 50,
      content: kpi.val,
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF'
    });
  });
  console.log('✓ Diapositiva KPI generada.');
}`,
    },
    {
      title: 'Marca de Agua Borrador',
      code: `function main(app) {
  app.presentation.slides.forEach(slide => {
    app.addShape({
      type: 'text',
      x: 200,
      y: 220,
      width: 560,
      height: 100,
      content: 'BORRADOR INTERNO',
      fontSize: 54,
      fontWeight: 'bold',
      color: '#E2E8F0',
      opacity: 0.25,
      textAlign: 'center'
    });
  });
  console.log('Marca de agua colocada en todas las diapositivas.');
}`,
    },
  ];

  const handleRun = async () => {
    setIsRunning(true);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Iniciando ejecución del macro...`]);

    try {
      const updatedPres = await MacroEngine.executeMacro(currentCode, presentation, (log) => {
        setLogs((prev) => [...prev, `[LOG] ${log}`]);
      });

      onUpdatePresentation(updatedPres);
      setLogs((prev) => [...prev, `[ÉXITO] Macro finalizado correctamente.`]);
    } catch (err: any) {
      setLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveMacro = () => {
    const updated = macros.map((m) => (m.id === selectedMacroId ? { ...m, code: currentCode } : m));
    setMacros(updated);
    onUpdatePresentation({ ...presentation, macros: updated });
    setLogs((prev) => [...prev, `[GUARDADO] Código del script guardado en el archivo.`]);
  };

  const handleNewMacro = () => {
    const newId = `macro-${Date.now()}`;
    const newM: MacroScript = {
      id: newId,
      name: `NuevoScript_${macros.length + 1}`,
      language: 'javascript',
      code: `function main(app) {\n  console.log("Hola desde el nuevo Office Script");\n}`,
    };
    const updated = [...macros, newM];
    setMacros(updated);
    setSelectedMacroId(newId);
    setCurrentCode(newM.code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-5xl h-[85vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-3 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>PowerPoint Script & Macro Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-normal">
                  VBA / TypeScript
                </span>
              </h2>
              <p className="text-xs opacity-70">
                Automatiza la creación de elementos, formatos por lotes y tareas repetitivas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunning ? 'Ejecutando...' : 'Ejecutar (F5)'}</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-500/20 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Scripts & Presets */}
          <div
            className={`w-64 border-r flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                  Tus Scripts ({macros.length})
                </span>
                <button
                  onClick={handleNewMacro}
                  className="p-1 rounded hover:bg-zinc-500/20 text-orange-500 cursor-pointer"
                  title="Nuevo script"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {macros.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMacroId(m.id);
                      setCurrentCode(m.code);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
                      selectedMacroId === m.id
                        ? 'bg-orange-500/15 text-orange-500 font-bold'
                        : 'hover:bg-zinc-500/10 opacity-80'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </div>

              <div className="h-[1px] bg-zinc-500/20 my-4" />

              {/* Sample Library */}
              <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2 block">
                Plantillas de Automatización
              </span>
              <div className="space-y-1.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentCode(preset.code)}
                    className="w-full px-3 py-1.5 rounded-lg border text-left text-xs hover:border-orange-500 transition cursor-pointer opacity-80 hover:opacity-100"
                  >
                    <div className="font-semibold">{preset.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Area: Code Editor & Console Output */}
          <div className="flex-1 flex flex-col">
            {/* Editor Code Area */}
            <div className="flex-1 relative font-mono text-xs p-4 overflow-auto bg-[#1E1E24] text-emerald-300">
              <textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent resize-none outline-none font-mono leading-relaxed"
              />
            </div>

            {/* Bottom Console Logs */}
            <div
              className={`h-40 border-t flex flex-col ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-900 text-zinc-200 border-zinc-700'
              }`}
            >
              <div className="px-4 py-1.5 border-b border-inherit flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consola de Salida & Logs de Depuración</span>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="hover:text-zinc-200 text-[10px] cursor-pointer"
                >
                  Limpiar consola
                </button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 text-zinc-300">
                {logs.length === 0 ? (
                  <span className="text-zinc-600 italic">Listo para ejecutar scripts de automatización...</span>
                ) : (
                  logs.map((log, i) => <div key={i}>{log}</div>)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
