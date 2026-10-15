import React, { useState, useEffect, useRef } from 'react';
import { OfficeTitleBar } from './components/ribbon/OfficeTitleBar';
import { OfficeRibbon } from './components/ribbon/OfficeRibbon';
import { BackstageView } from './components/ribbon/BackstageView';
import { SlideThumbnailList } from './components/sidebar/SlideThumbnailList';
import { SlideSorterView } from './components/sidebar/SlideSorterView';
import { SlideCanvas } from './components/canvas/SlideCanvas';
import { NotesDrawer } from './components/canvas/NotesDrawer';
import { StatusBar } from './components/canvas/StatusBar';
import { GoogleDriveDialog } from './components/dialogs/GoogleDriveDialog';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { ShareModal } from './components/dialogs/ShareModal';
import { MacroEditorDialog } from './components/macros/MacroEditorDialog';
import { ExtensionsPanel } from './components/extensions/ExtensionsPanel';
import { PresenterModal } from './components/slideshow/PresenterModal';
import { CommentsPane } from './components/sidebar/CommentsPane';

import {
  Presentation,
  Slide,
  SlideElement,
  ActiveViewMode,
  ActiveRibbonTab,
  SlideLayout,
  CollaborationUser,
  ShapeType,
  PresentationTheme,
} from './types/presentation';
import { defaultPresentation, themesList } from './utils/defaultData';
import { parsePptxFile } from './utils/pptxHandler';
import { importPdfAsPresentation } from './utils/pdfHandler';
import { GoogleDriveService, GoogleDriveAuthState } from './services/googleDriveService';
import { CollaborationService } from './services/collaborationService';

export default function App() {
  // Theme & Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('powerpoint_dark_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Active Ribbon Tab
  const [activeRibbonTab, setActiveRibbonTab] = useState<ActiveRibbonTab>('home');

  // Master Presentation State
  const [presentation, setPresentation] = useState<Presentation>(() => {
    const saved = localStorage.getItem('powerpoint_current_presentation');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0 && typeof parsed.title === 'string') {
          return parsed;
        }
      } catch (e) {
        console.error('Error reading saved presentation', e);
      }
    }
    return defaultPresentation;
  });

  // Active Slide and Selection State
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // View Modes & Layout
  const [viewMode, setViewMode] = useState<ActiveViewMode>('normal');
  const [zoom, setZoom] = useState<number>(90);
  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);

  // Dialogs and Modals
  const [backstageOpen, setBackstageOpen] = useState<boolean>(false);
  const [googleDriveOpen, setGoogleDriveOpen] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [macroDialogOpen, setMacroDialogOpen] = useState<boolean>(false);
  const [extensionsOpen, setExtensionsOpen] = useState<boolean>(false);
  const [slideshowOpen, setSlideshowOpen] = useState<boolean>(false);

  // Drawing Tools State (for Stylus / Pen in Ribbon)
  const [drawMode, setDrawMode] = useState<'none' | 'pen' | 'highlighter' | 'eraser'>('none');
  const [drawColor, setDrawColor] = useState<string>('#EF4444');
  const [drawWidth, setDrawWidth] = useState<number>(4);

  // Collaboration State
  const [collabService, setCollabService] = useState<CollaborationService | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaborationUser>({
    id: `user-${Math.random().toString(36).substring(2, 7)}`,
    name: 'Usuario Principal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    color: '#C43E1C',
    isHost: true,
  });

  // Google Drive Auth
  const [driveAuth, setDriveAuth] = useState<GoogleDriveAuthState>(GoogleDriveService.getAuthState());

  // History for Undo / Redo
  const [history, setHistory] = useState<Presentation[]>([presentation]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const activeSlide =
    (presentation?.slides && presentation.slides[activeSlideIndex]) ||
    presentation?.slides?.[0] ||
    defaultPresentation.slides[0];

  const activeTheme =
    themesList.find(
      (t) =>
        t.id ===
        (typeof presentation?.theme === 'string'
          ? presentation.theme
          : (presentation?.theme as any)?.id)
    ) || themesList[0];

  // Persist dark mode and presentation
  useEffect(() => {
    localStorage.setItem('powerpoint_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('powerpoint_current_presentation', JSON.stringify(presentation));
  }, [presentation]);

  // Setup Real-time Collaboration Channel
  useEffect(() => {
    const service = new CollaborationService(
      'powerpoint-suite-shared-room',
      currentUser,
      (users) => setActiveUsers(users),
      (remotePres) => {
        setPresentation(remotePres);
      }
    );

    setCollabService(service);

    return () => {
      service.disconnect();
    };
  }, []);

  // Update cursor presence
  const handleCanvasCursorMove = (x: number, y: number) => {
    if (collabService && activeSlide) {
      collabService.broadcastCursor(x, y, activeSlide.id);
    }
  };

  // State commit with Undo / Redo tracking
  const updatePresentationState = (newPres: Presentation, recordHistory = true) => {
    setPresentation(newPres);
    if (collabService) {
      collabService.broadcastPresentation(newPres);
    }
    if (recordHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newPres);
      if (newHistory.length > 40) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setPresentation(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setPresentation(history[newIdx]);
    }
  };

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Ctrl+M, F5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveLocal();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleAddSlide('titleAndContent');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setSlideshowOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Slide CRUD Actions
  const handleAddSlide = (layout: SlideLayout = 'titleAndContent') => {
    const newSlideId = `slide-${Date.now()}`;
    let elements: SlideElement[] = [];

    if (layout === 'title') {
      elements = [
        {
          id: `el-t-${Date.now()}`,
          type: 'text',
          x: 80,
          y: 180,
          width: 800,
          height: 80,
          content: 'Haga clic para agregar título',
          fontSize: 40,
          fontWeight: 'bold',
          color: activeTheme.textColor,
          textAlign: 'center',
        },
        {
          id: `el-sub-${Date.now()}`,
          type: 'text',
          x: 120,
          y: 280,
          width: 720,
          height: 50,
          content: 'Haga clic para agregar subtítulo',
          fontSize: 20,
          color: '#64748B',
          textAlign: 'center',
        },
      ];
    } else if (layout === 'titleAndContent') {
      elements = [
        {
          id: `el-t-${Date.now()}`,
          type: 'text',
          x: 60,
          y: 40,
          width: 840,
          height: 60,
          content: 'Haga clic para agregar título',
          fontSize: 32,
          fontWeight: 'bold',
          color: activeTheme.textColor,
        },
        {
          id: `el-c-${Date.now()}`,
          type: 'text',
          x: 60,
          y: 120,
          width: 840,
          height: 360,
          content: '• Escriba su primer punto clave aquí\n• Añada detalles adicionales con formato y viñetas\n• Inserte imágenes, gráficos o diagramas interactivos',
          fontSize: 18,
          lineHeight: 1.6,
          color: activeTheme.textColor,
        },
      ];
    }

    const newSlide: Slide = {
      id: newSlideId,
      slideNumber: presentation.slides.length + 1,
      title: 'Nueva Diapositiva',
      layout,
      elements,
      comments: [],
      notes: '',
    };

    const newSlides = [...presentation.slides, newSlide];
    updatePresentationState({ ...presentation, slides: newSlides });
    setActiveSlideIndex(newSlides.length - 1);
  };

  const handleDuplicateSlide = (index: number) => {
    const target = presentation.slides[index];
    if (!target) return;

    const dupSlide: Slide = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide-dup-${Date.now()}`,
      title: `${target.title} (Copia)`,
      slideNumber: presentation.slides.length + 1,
    };

    const newSlides = [...presentation.slides];
    newSlides.splice(index + 1, 0, dupSlide);
    updatePresentationState({ ...presentation, slides: newSlides });
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (presentation.slides.length <= 1) return;
    const newSlides = presentation.slides.filter((_, i) => i !== index);
    updatePresentationState({ ...presentation, slides: newSlides });
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    const newSlides = [...presentation.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    updatePresentationState({ ...presentation, slides: newSlides });
    setActiveSlideIndex(toIndex);
  };

  const handleToggleHideSlide = (index: number) => {
    const newSlides = [...presentation.slides];
    newSlides[index].hidden = !newSlides[index].hidden;
    updatePresentationState({ ...presentation, slides: newSlides });
  };

  // Element Actions
  const handleUpdateElement = (id: string, updates: Partial<SlideElement>) => {
    if (!activeSlide) return;

    // If new drawing element
    const exists = activeSlide.elements.some((el) => el.id === id);
    let newElements: SlideElement[];

    if (!exists && updates.type === 'draw') {
      newElements = [...activeSlide.elements, updates as SlideElement];
    } else {
      newElements = activeSlide.elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    }

    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, elements: newElements } : s
    );

    updatePresentationState({ ...presentation, slides: newSlides });
  };

  const handleDeleteElement = (id: string) => {
    if (!activeSlide) return;
    const newElements = activeSlide.elements.filter((el) => el.id !== id);
    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, elements: newElements } : s
    );
    setSelectedElementId(null);
    updatePresentationState({ ...presentation, slides: newSlides });
  };

  const handleAddSlideElement = (el: SlideElement) => {
    if (!activeSlide) return;
    const newElements = [...activeSlide.elements, el];
    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, elements: newElements } : s
    );
    setSelectedElementId(el.id);
    updatePresentationState({ ...presentation, slides: newSlides });
  };

  // Insert Shape Handler from Ribbon
  const handleInsertShape = (shapeType: ShapeType) => {
    const newEl: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 380,
      y: 180,
      width: 200,
      height: 120,
      fill: activeTheme.primaryColor || '#C43E1C',
      color: '#FFFFFF',
      zIndex: activeSlide.elements.length + 1,
      borderRadius: shapeType === 'roundedRectangle' ? 12 : 0,
    };
    handleAddSlideElement(newEl);
  };

  // Insert Text Box from Ribbon
  const handleInsertTextBox = () => {
    const newEl: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 280,
      y: 200,
      width: 400,
      height: 70,
      content: 'Escriba texto aquí',
      fontSize: 22,
      color: activeTheme.textColor || '#0F172A',
      zIndex: activeSlide.elements.length + 1,
    };
    handleAddSlideElement(newEl);
  };

  // Insert Table from Ribbon
  const handleInsertTable = (rows = 3, cols = 3) => {
    const tableData = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        text: r === 0 ? `Encabezado ${c + 1}` : `Dato ${r},${c + 1}`,
        fill: r === 0 ? activeTheme.primaryColor || '#C43E1C' : undefined,
        color: r === 0 ? '#FFFFFF' : undefined,
        fontWeight: r === 0 ? ('bold' as const) : ('normal' as const),
      }))
    );

    const newEl: SlideElement = {
      id: `table-${Date.now()}`,
      type: 'table',
      x: 180,
      y: 140,
      width: 600,
      height: 220,
      tableData,
      zIndex: activeSlide.elements.length + 1,
    };
    handleAddSlideElement(newEl);
  };

  // Insert Chart from Ribbon
  const handleInsertChart = (chartType: 'bar' | 'column' | 'pie') => {
    const newEl: SlideElement = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      x: 200,
      y: 120,
      width: 560,
      height: 300,
      chartData: {
        chartType,
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Crecimiento de Ventas',
            data: [65, 85, 120, 150],
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#C43E1C'],
          },
        ],
      },
      zIndex: activeSlide.elements.length + 1,
    };

    handleAddSlideElement(newEl);
  };

  // Insert Image from Ribbon
  const handleAddImage = (src: string) => {
    const newEl: SlideElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      src,
      x: 240,
      y: 100,
      width: 480,
      height: 320,
      zIndex: (activeSlide?.elements.length || 0) + 1,
    };
    handleAddSlideElement(newEl);
  };

  // Insert QR Code from Ribbon
  const handleAddQrCode = () => {
    const newEl: SlideElement = {
      id: `qr-${Date.now()}`,
      type: 'qrcode',
      qrValue: 'https://powerpoint.office.com',
      x: 380,
      y: 170,
      width: 200,
      height: 200,
      zIndex: (activeSlide?.elements.length || 0) + 1,
    };
    handleAddSlideElement(newEl);
  };

  // Insert SmartArt Diagram
  const handleAddSmartArt = (
    diagramType: 'process' | 'matrix' | 'timeline' | 'swot' | 'hierarchy' | 'funnel' | 'cards' = 'process'
  ) => {
    const newEl: SlideElement = {
      id: `smartart-${Date.now()}`,
      type: 'smartArt',
      x: 100,
      y: 150,
      width: 760,
      height: 240,
      diagramType,
      diagramItems: [
        { id: '1', title: 'Fase 1: Diagnóstico', description: 'Evaluación y levantamiento de requerimientos' },
        { id: '2', title: 'Fase 2: Ejecución', description: 'Implementación ágil e integración de sistemas' },
        { id: '3', title: 'Fase 3: Impacto', description: 'Medición de valor y escalamiento continuo' },
      ],
      zIndex: (activeSlide?.elements.length || 0) + 1,
    };
    handleAddSlideElement(newEl);
  };

  // Layer Ordering Handlers
  const handleBringToFront = () => {
    if (!activeSlide || !selectedElementId) return;
    const maxZ = Math.max(...activeSlide.elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElement(selectedElementId, { zIndex: maxZ + 1 });
  };

  const handleSendToBack = () => {
    if (!activeSlide || !selectedElementId) return;
    const minZ = Math.min(...activeSlide.elements.map((e) => e.zIndex || 0), 1);
    handleUpdateElement(selectedElementId, { zIndex: Math.max(0, minZ - 1) });
  };

  const handleUpdateSlide = (updates: Partial<Slide>) => {
    if (!activeSlide) return;
    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, ...updates } : s
    );
    updatePresentationState({ ...presentation, slides: newSlides });
  };

  // Update Notes
  const handleUpdateNotes = (notes: string) => {
    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, notes } : s
    );
    updatePresentationState({ ...presentation, slides: newSlides }, false);
  };

  // Add & Resolve Comments
  const handleAddComment = (text: string) => {
    if (!activeSlide) return;
    const newComment = {
      id: `c-${Date.now()}`,
      author: currentUser,
      text,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    const newComments = [...(activeSlide.comments || []), newComment];
    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, comments: newComments } : s
    );
    updatePresentationState({ ...presentation, slides: newSlides });
  };

  const handleResolveComment = (commentId: string) => {
    if (!activeSlide) return;
    const newComments = (activeSlide.comments || []).map((c) =>
      c.id === commentId ? { ...c, resolved: true } : c
    );
    const newSlides = presentation.slides.map((s, idx) =>
      idx === activeSlideIndex ? { ...s, comments: newComments } : s
    );
    updatePresentationState({ ...presentation, slides: newSlides });
  };

  // Open / Import Files (.pptx, .potx, .pptm, .pdf, .json)
  const handleOpenFromFile = async (file: File) => {
    const name = file.name.toLowerCase();

    if (name.endsWith('.pptx') || name.endsWith('.potx') || name.endsWith('.pptm')) {
      try {
        const parsed = await parsePptxFile(file);
        updatePresentationState(parsed);
        setActiveSlideIndex(0);
      } catch (err: any) {
        alert(`Error al abrir archivo de PowerPoint: ${err.message}`);
      }
    } else if (name.endsWith('.pdf')) {
      try {
        const parsed = await importPdfAsPresentation(file);
        updatePresentationState(parsed);
        setActiveSlideIndex(0);
      } catch (err: any) {
        alert(`Error al importar documento PDF: ${err.message}`);
      }
    } else if (name.endsWith('.json')) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        updatePresentationState(parsed);
        setActiveSlideIndex(0);
      } catch (err: any) {
        alert(`Error al leer archivo JSON: ${err.message}`);
      }
    }
  };

  // New Presentation Templates
  const handleNewPresentation = (templateId = 'blank') => {
    const themeFound = themesList.find((t) => t.id === templateId) || themesList[0];
    const newPres: Presentation = {
      id: `pres-${Date.now()}`,
      title: templateId === 'blank' ? 'Presentación sin título' : themeFound.name,
      slides: [
        {
          id: `slide-1`,
          slideNumber: 1,
          title: 'Título de la Presentación',
          layout: 'title',
          elements: [
            {
              id: 'el-title',
              type: 'text',
              x: 80,
              y: 180,
              width: 800,
              height: 90,
              content: 'Haga clic para agregar título',
              fontSize: 44,
              fontWeight: 'bold',
              color: themeFound.textColor,
              textAlign: 'center',
            },
            {
              id: 'el-sub',
              type: 'text',
              x: 120,
              y: 290,
              width: 720,
              height: 50,
              content: 'Haga clic para agregar subtítulo',
              fontSize: 20,
              color: '#64748B',
              textAlign: 'center',
            },
          ],
        },
      ],
      theme: themeFound.id,
      aspectRatio: '16:9',
      fileFormat: 'pptx',
      macros: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updatePresentationState(newPres);
    setActiveSlideIndex(0);
  };

  const handleSaveLocal = () => {
    localStorage.setItem('powerpoint_current_presentation', JSON.stringify(presentation));
    const banner = document.createElement('div');
    banner.innerText = '✓ Presentación guardada localmente en el navegador';
    banner.className =
      'fixed bottom-10 right-10 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold z-50 animate-bounce';
    document.body.appendChild(banner);
    setTimeout(() => document.body.removeChild(banner), 2500);
  };

  return (
    <div
      id="powerpoint-web-suite-root"
      className={`w-screen h-screen flex flex-col overflow-hidden font-sans select-none transition-colors ${
        isDarkMode ? 'bg-[#18181B] text-zinc-100' : 'bg-white text-zinc-900'
      }`}
    >
      {/* 1. Office Title Bar (App Header) */}
      <OfficeTitleBar
        presentation={presentation}
        onUpdateTitle={(title) => updatePresentationState({ ...presentation, title })}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        driveAuth={driveAuth}
        onOpenDrive={() => setGoogleDriveOpen(true)}
        onOpenShare={() => setShareModalOpen(true)}
        onQuickSave={handleSaveLocal}
        isSaving={false}
        activeUsers={activeUsers}
        onOpenExtensions={(tab) => {
          setExtensionsOpen(true);
        }}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* 2. Office Ribbon Command Bar */}
      <OfficeRibbon
        activeTab={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
        onOpenFileMenu={() => setBackstageOpen(true)}
        isDarkMode={isDarkMode}

        // Actions
        onAddSlide={handleAddSlide}
        onDuplicateSlide={() => handleDuplicateSlide(activeSlideIndex)}
        onDeleteSlide={() => handleDeleteSlide(activeSlideIndex)}
        onAddText={handleInsertTextBox}
        onAddShape={handleInsertShape}
        onAddImage={handleAddImage}
        onAddTable={handleInsertTable}
        onAddChart={handleInsertChart}
        onAddQrCode={handleAddQrCode}
        onAddSmartArt={handleAddSmartArt}

        // Selection & Formatting
        selectedElement={activeSlide?.elements.find((el) => el.id === selectedElementId) || null}
        onUpdateElement={(updates) => {
          if (selectedElementId) handleUpdateElement(selectedElementId, updates);
        }}
        onDeleteElement={() => {
          if (selectedElementId) handleDeleteElement(selectedElementId);
        }}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}

        // Presentation State
        currentSlide={activeSlide}
        onUpdateSlide={handleUpdateSlide}
        themes={themesList}
        currentTheme={activeTheme}
        onSelectTheme={(theme) => updatePresentationState({ ...presentation, theme: theme.id })}

        // Modes
        drawMode={drawMode}
        onSetDrawMode={setDrawMode}
        drawColor={drawColor}
        onSetDrawColor={setDrawColor}
        drawWidth={drawWidth}
        onSetDrawWidth={setDrawWidth}

        // Slideshow & Views
        onStartSlideshow={(fromBeginning) => {
          if (fromBeginning) setActiveSlideIndex(0);
          setSlideshowOpen(true);
        }}
        onStartPresenterMode={() => {
          setSlideshowOpen(true);
        }}
        viewMode={viewMode === 'reading' ? 'reading' : viewMode === 'sorter' ? 'sorter' : 'normal'}
        onSetViewMode={(vm) => setViewMode(vm)}

        // Dialogs
        onOpenMacroEditor={() => setMacroDialogOpen(true)}
        onOpenExtensions={() => setExtensionsOpen(true)}
        onOpenExport={() => setExportDialogOpen(true)}
        onToggleCommentsPane={() => setCommentsOpen(!commentsOpen)}
        commentsCount={activeSlide?.comments?.length || 0}
      />

      {/* 3. Main Workspace Center Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Slide Thumbnails Sidebar (visible in normal mode) */}
        {viewMode === 'normal' && (
          <SlideThumbnailList
            slides={presentation.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={(idx) => {
              setActiveSlideIndex(idx);
              setSelectedElementId(null);
            }}
            onAddSlide={handleAddSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
            onToggleHideSlide={handleToggleHideSlide}
            activeUsers={activeUsers}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Center Area: Normal Slide Canvas vs Slide Sorter Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'sorter' ? (
            <SlideSorterView
              slides={presentation.slides}
              activeSlideIndex={activeSlideIndex}
              onSelectSlide={(idx) => {
                setActiveSlideIndex(idx);
                setViewMode('normal');
              }}
              onAddSlide={handleAddSlide}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onMoveSlide={handleMoveSlide}
              onStartSlideshow={(fromBeginning) => {
                if (fromBeginning) setActiveSlideIndex(0);
                setSlideshowOpen(true);
              }}
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              {activeSlide && (
                <SlideCanvas
                  slide={activeSlide}
                  theme={activeTheme}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  zoom={zoom}
                  isDarkMode={isDarkMode}
                  activeUsers={activeUsers}
                  onCursorMove={handleCanvasCursorMove}
                  drawMode={drawMode}
                  drawColor={drawColor}
                  drawWidth={drawWidth}
                />
              )}

              {/* Bottom Speaker Notes Drawer */}
              {activeSlide && (
                <NotesDrawer
                  isOpen={notesOpen}
                  onToggle={() => setNotesOpen(!notesOpen)}
                  slide={activeSlide}
                  onUpdateNotes={handleUpdateNotes}
                  isDarkMode={isDarkMode}
                />
              )}
            </>
          )}
        </div>

        {/* Right Comments Drawer */}
        {commentsOpen && activeSlide && (
          <CommentsPane
            isOpen={commentsOpen}
            onClose={() => setCommentsOpen(false)}
            slide={activeSlide}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* 4. Office Status Bar */}
      <StatusBar
        currentSlideIndex={activeSlideIndex}
        totalSlides={presentation.slides.length}
        notesOpen={notesOpen}
        onToggleNotes={() => setNotesOpen(!notesOpen)}
        commentsCount={activeSlide?.comments?.length || 0}
        onToggleComments={() => setCommentsOpen(!commentsOpen)}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        zoom={zoom}
        onSetZoom={setZoom}
        onFitToWindow={() => setZoom(90)}
        onStartSlideshow={() => setSlideshowOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* 5. Modals and Dialogs */}
      {/* Backstage View (File Menu) */}
      <BackstageView
        isOpen={backstageOpen}
        onClose={() => setBackstageOpen(false)}
        isDarkMode={isDarkMode}
        presentation={presentation}
        onNewPresentation={handleNewPresentation}
        onOpenFromFile={handleOpenFromFile}
        onOpenDriveDialog={() => setGoogleDriveOpen(true)}
        onSaveLocal={handleSaveLocal}
        onSaveDrive={() => setGoogleDriveOpen(true)}
        onOpenExportDialog={() => setExportDialogOpen(true)}
        driveAuth={driveAuth}
      />

      {/* Google Drive File Manager */}
      <GoogleDriveDialog
        isOpen={googleDriveOpen}
        onClose={() => setGoogleDriveOpen(false)}
        isDarkMode={isDarkMode}
        presentation={presentation}
        onLoadPresentation={(newPres) => {
          updatePresentationState(newPres);
          setActiveSlideIndex(0);
        }}
        onDriveAuthChange={setDriveAuth}
      />

      {/* Export Multi-Format Dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        isDarkMode={isDarkMode}
        presentation={presentation}
      />

      {/* Real-time Collaboration & Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        isDarkMode={isDarkMode}
        activeUsers={activeUsers}
        presentationTitle={presentation.title}
      />

      {/* Macro Studio & Script Automator */}
      <MacroEditorDialog
        isOpen={macroDialogOpen}
        onClose={() => setMacroDialogOpen(false)}
        isDarkMode={isDarkMode}
        presentation={presentation}
        onUpdatePresentation={updatePresentationState}
      />

      {/* Extensions Hub */}
      {activeSlide && (
        <ExtensionsPanel
          isOpen={extensionsOpen}
          onClose={() => setExtensionsOpen(false)}
          isDarkMode={isDarkMode}
          presentation={presentation}
          currentSlide={activeSlide}
          onUpdateSlide={(slideId, updates) => {
            const newSlides = presentation.slides.map((s) =>
              s.id === slideId ? { ...s, ...updates } : s
            );
            updatePresentationState({ ...presentation, slides: newSlides });
          }}
          onAddSlideElement={handleAddSlideElement}
          onApplyNewPresentation={(newPres) => {
            updatePresentationState(newPres);
            setActiveSlideIndex(0);
          }}
        />
      )}

      {/* Fullscreen Presentation & Presenter Mode */}
      <PresenterModal
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        presentation={presentation}
        initialSlideIndex={activeSlideIndex}
      />
    </div>
  );
}
