import { Presentation, PresentationTheme, MacroScript, Slide } from '../types/presentation';

export const OFFICE_THEMES: PresentationTheme[] = [
  {
    id: 'office-classic',
    name: 'Office Moderno (Predeterminado)',
    primaryColor: '#C43E1C', // PowerPoint Coral Red/Orange
    secondaryColor: '#2B579A',
    accentColor: '#D24726',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F8FAFC',
    textColor: '#1E293B',
    textMutedColor: '#64748B',
    fontHeading: 'Segoe UI, system-ui, sans-serif',
    fontBody: 'Segoe UI, system-ui, sans-serif',
    isDark: false,
  },
  {
    id: 'executive-dark',
    name: 'Obsidian Ejecutivo (Modo Oscuro)',
    primaryColor: '#38BDF8',
    secondaryColor: '#818CF8',
    accentColor: '#F43F5E',
    backgroundColor: '#0F172A',
    surfaceColor: '#1E293B',
    textColor: '#F8FAFC',
    textMutedColor: '#94A3B8',
    fontHeading: 'Segoe UI, system-ui, sans-serif',
    fontBody: 'Segoe UI, system-ui, sans-serif',
    isDark: true,
  },
  {
    id: 'slate-corporate',
    name: 'Pizarra Corporativa',
    primaryColor: '#0F766E',
    secondaryColor: '#0369A1',
    accentColor: '#F59E0B',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    textMutedColor: '#475569',
    fontHeading: 'Segoe UI, system-ui, sans-serif',
    fontBody: 'Segoe UI, system-ui, sans-serif',
    isDark: false,
  },
  {
    id: 'wisp-minimal',
    name: 'Wisp Minimalista',
    primaryColor: '#6366F1',
    secondaryColor: '#EC4899',
    accentColor: '#10B981',
    backgroundColor: '#FAFAFA',
    surfaceColor: '#FFFFFF',
    textColor: '#18181B',
    textMutedColor: '#71717A',
    fontHeading: 'Segoe UI, system-ui, sans-serif',
    fontBody: 'Segoe UI, system-ui, sans-serif',
    isDark: false,
  },
  {
    id: 'celestial-gradient',
    name: 'Aurora Boreal',
    primaryColor: '#8B5CF6',
    secondaryColor: '#06B6D4',
    accentColor: '#F43F5E',
    backgroundColor: '#111827',
    surfaceColor: '#1F2937',
    textColor: '#F9FAFB',
    textMutedColor: '#9CA3AF',
    fontHeading: 'Segoe UI, system-ui, sans-serif',
    fontBody: 'Segoe UI, system-ui, sans-serif',
    isDark: true,
  },
  {
    id: 'emerald-growth',
    name: 'Esmeralda Sostenible',
    primaryColor: '#059669',
    secondaryColor: '#0D9488',
    accentColor: '#EAB308',
    backgroundColor: '#F0FDF4',
    surfaceColor: '#FFFFFF',
    textColor: '#064E3B',
    textMutedColor: '#047857',
    fontHeading: 'Segoe UI, system-ui, sans-serif',
    fontBody: 'Segoe UI, system-ui, sans-serif',
    isDark: false,
  },
];

export const DEFAULT_MACROS: MacroScript[] = [
  {
    id: 'macro-number-slides',
    name: 'AutoNumerarDiapositivas',
    description: 'Agrega o actualiza automáticamente el número de diapositiva en el pie de página de todo el mazo.',
    language: 'javascript',
    code: `// Macro de Office Script / JavaScript
function AutoNumerarDiapositivas(app) {
  const pres = app.getActivePresentation();
  const slides = pres.slides;
  
  slides.forEach((slide, index) => {
    // Elimina numeraciones previas si existen
    slide.elements = slide.elements.filter(el => el.id !== 'auto_footer_slide_num');
    
    // Inserta badge de número elegante en la esquina inferior derecha
    slide.elements.push({
      id: 'auto_footer_slide_num',
      type: 'text',
      x: 840,
      y: 505,
      width: 80,
      height: 25,
      content: \`\${index + 1} / \${slides.length}\`,
      fontSize: 12,
      fontWeight: 'bold',
      color: '#94A3B8',
      textAlign: 'right',
      zIndex: 999
    });
  });
  
  app.log(\`✅ Se numeraron exitosamente \${slides.length} diapositivas.\`);
}`,
    lastRun: '2026-08-26',
    isCustom: false,
  },
  {
    id: 'macro-brand-watermark',
    name: 'AplicarMarcaAguaConfidencial',
    description: 'Inserta una etiqueta de "CONFIDENCIAL" y fecha en la cabecera de todas las diapositivas.',
    language: 'javascript',
    code: `function AplicarMarcaAguaConfidencial(app) {
  const pres = app.getActivePresentation();
  const slides = pres.slides;
  const now = new Date().toLocaleDateString('es-ES');
  
  slides.forEach((slide) => {
    slide.elements = slide.elements.filter(el => el.id !== 'auto_confidential_tag');
    slide.elements.push({
      id: 'auto_confidential_tag',
      type: 'shape',
      shapeType: 'roundedRectangle',
      x: 40,
      y: 18,
      width: 220,
      height: 24,
      fill: '#EF4444',
      opacity: 0.12,
      borderRadius: 12,
      zIndex: 900
    });
    slide.elements.push({
      id: 'auto_confidential_tag_text',
      type: 'text',
      x: 45,
      y: 20,
      width: 210,
      height: 20,
      content: \`🔒 CONFIDENCIAL • \${now}\`,
      fontSize: 10,
      fontWeight: 'bold',
      color: '#DC2626',
      textAlign: 'center',
      zIndex: 901
    });
  });
  
  app.log(\`🔒 Marca confidencial agregada a \${slides.length} diapositivas.\`);
}`,
    lastRun: undefined,
    isCustom: false,
  },
  {
    id: 'macro-create-kpi-card',
    name: 'CrearTarjetasMetricasKPI',
    description: 'Genera un conjunto de 3 tarjetas de indicadores clave (KPI) con iconos en la diapositiva actual.',
    language: 'javascript',
    code: `function CrearTarjetasMetricasKPI(app) {
  const slide = app.getActiveSlide();
  if (!slide) return app.error('No hay diapositiva activa seleccionada.');
  
  const kpis = [
    { label: 'Crecimiento Anual', val: '+142%', color: '#10B981', bg: '#ECFDF5' },
    { label: 'Clientes Activos', val: '58.4K', color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Tasa Retención', val: '98.6%', color: '#8B5CF6', bg: '#F5F3FF' }
  ];
  
  const startX = 60;
  const cardWidth = 260;
  const gap = 30;
  const y = 200;
  
  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (cardWidth + gap);
    
    // Fondo de la tarjeta
    slide.elements.push({
      id: \`kpi_card_\${Date.now()}_\${idx}\`,
      type: 'shape',
      shapeType: 'roundedRectangle',
      x: x,
      y: y,
      width: cardWidth,
      height: 160,
      fill: kpi.bg,
      stroke: kpi.color,
      strokeWidth: 1.5,
      borderRadius: 16,
      zIndex: 10
    });
    
    // Valor Numérico
    slide.elements.push({
      id: \`kpi_val_\${Date.now()}_\${idx}\`,
      type: 'text',
      x: x + 20,
      y: y + 25,
      width: cardWidth - 40,
      height: 50,
      content: kpi.val,
      fontSize: 36,
      fontWeight: 'bold',
      color: kpi.color,
      textAlign: 'left',
      zIndex: 11
    });
    
    // Etiqueta
    slide.elements.push({
      id: \`kpi_lbl_\${Date.now()}_\${idx}\`,
      type: 'text',
      x: x + 20,
      y: y + 85,
      width: cardWidth - 40,
      height: 40,
      content: kpi.label,
      fontSize: 15,
      color: '#475569',
      textAlign: 'left',
      zIndex: 12
    });
  });
  
  app.log('✨ 3 Tarjetas KPI creadas en la diapositiva actual.');
}`,
    lastRun: undefined,
    isCustom: false,
  },
  {
    id: 'macro-vba-sample',
    name: 'VBA_ExportToOutline',
    description: 'Script compatible con VBA para exportar todos los títulos y notas a texto estructurado.',
    language: 'vba',
    code: `' Macro VBA Compatible de PowerPoint
Sub ExportToOutline()
    Dim oSlide As Slide
    Dim oShape As Shape
    Dim sOutline As String
    
    For Each oSlide In ActivePresentation.Slides
        sOutline = sOutline & "=== Diapositiva " & oSlide.SlideIndex & " ===" & vbCrLf
        For Each oShape In oSlide.Shapes
            If oShape.HasTextFrame Then
                sOutline = sOutline & " - " & oShape.TextFrame.TextRange.Text & vbCrLf
            End If
        Next oShape
    Next oSlide
    
    MsgBox "Esquema generado con éxito"
End Sub`,
    lastRun: undefined,
    isCustom: false,
  }
];

export const INITIAL_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    slideNumber: 1,
    title: 'Transformación e Innovación 2026',
    layout: 'title',
    background: {
      type: 'solid',
      color: '#0F172A',
    },
    notes: 'Iniciar la presentación dando la bienvenida a los miembros de la junta y al equipo ejecutivo. Presentar los tres ejes principales de innovación para el año fiscal 2026.',
    transition: {
      type: 'fade',
      duration: 600,
    },
    elements: [
      {
        id: 'el-bg-glow',
        type: 'shape',
        shapeType: 'circle',
        x: 650,
        y: 40,
        width: 320,
        height: 320,
        fill: '#C2410C',
        opacity: 0.18,
        zIndex: 1,
      },
      {
        id: 'el-tag',
        type: 'shape',
        shapeType: 'roundedRectangle',
        x: 80,
        y: 110,
        width: 220,
        height: 34,
        fill: '#C2410C',
        borderRadius: 17,
        zIndex: 2,
      },
      {
        id: 'el-tag-text',
        type: 'text',
        x: 95,
        y: 117,
        width: 190,
        height: 24,
        content: '✦ PLAN ESTRATÉGICO 2026',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        zIndex: 3,
      },
      {
        id: 'el-title',
        type: 'text',
        x: 80,
        y: 165,
        width: 780,
        height: 120,
        content: 'Transformación Digital y Crecimiento Escalable',
        fontSize: 44,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 1.15,
        zIndex: 4,
      },
      {
        id: 'el-subtitle',
        type: 'text',
        x: 80,
        y: 300,
        width: 720,
        height: 70,
        content: 'Construyendo el futuro con tecnología en la nube, automatización mediante scripts y colaboración en tiempo real.',
        fontSize: 19,
        color: '#94A3B8',
        textAlign: 'left',
        lineHeight: 1.4,
        zIndex: 5,
      },
      {
        id: 'el-author',
        type: 'text',
        x: 80,
        y: 440,
        width: 450,
        height: 35,
        content: 'Presentado por: Equipo de Arquitectura y Liderazgo',
        fontSize: 14,
        color: '#CBD5E1',
        fontWeight: '600',
        zIndex: 6,
      },
      {
        id: 'el-date',
        type: 'text',
        x: 740,
        y: 440,
        width: 180,
        height: 35,
        content: 'Agosto 2026',
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'right',
        zIndex: 7,
      }
    ],
  },
  {
    id: 'slide-2',
    slideNumber: 2,
    title: 'Pilares Clave y Metas de Rendimiento',
    layout: 'kpiDashboard',
    background: {
      type: 'solid',
      color: '#FFFFFF',
    },
    notes: 'Explicar cómo estos tres pilares se traducen en valor directo para el cliente y reducción de costos operativos.',
    transition: {
      type: 'slide',
      duration: 500,
    },
    elements: [
      {
        id: 's2-title',
        type: 'text',
        x: 70,
        y: 45,
        width: 820,
        height: 50,
        content: 'Pilares Clave y Métricas de Rendimiento',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'left',
        zIndex: 1,
      },
      {
        id: 's2-subtitle',
        type: 'text',
        x: 70,
        y: 95,
        width: 820,
        height: 30,
        content: 'Resultados proyectados con la adopción de las nuevas capacidades de ofimática y nube',
        fontSize: 15,
        color: '#64748B',
        zIndex: 2,
      },
      // Card 1
      {
        id: 's2-card-1',
        type: 'shape',
        shapeType: 'roundedRectangle',
        x: 70,
        y: 150,
        width: 255,
        height: 280,
        fill: '#F8FAFC',
        stroke: '#E2E8F0',
        strokeWidth: 1,
        borderRadius: 14,
        zIndex: 3,
      },
      {
        id: 's2-c1-icon-bg',
        type: 'shape',
        shapeType: 'circle',
        x: 95,
        y: 175,
        width: 48,
        height: 48,
        fill: '#EA580C',
        opacity: 0.15,
        zIndex: 4,
      },
      {
        id: 's2-c1-kpi',
        type: 'text',
        x: 95,
        y: 240,
        width: 205,
        height: 48,
        content: '+68%',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#C2410C',
        zIndex: 5,
      },
      {
        id: 's2-c1-h',
        type: 'text',
        x: 95,
        y: 295,
        width: 205,
        height: 28,
        content: 'Velocidad de Flujo',
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E293B',
        zIndex: 6,
      },
      {
        id: 's2-c1-desc',
        type: 'text',
        x: 95,
        y: 330,
        width: 205,
        height: 80,
        content: 'Automatización con scripts Office y macros para creación ágil de informes.',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.4,
        zIndex: 7,
      },
      // Card 2
      {
        id: 's2-card-2',
        type: 'shape',
        shapeType: 'roundedRectangle',
        x: 350,
        y: 150,
        width: 255,
        height: 280,
        fill: '#F8FAFC',
        stroke: '#E2E8F0',
        strokeWidth: 1,
        borderRadius: 14,
        zIndex: 3,
      },
      {
        id: 's2-c2-kpi',
        type: 'text',
        x: 375,
        y: 240,
        width: 205,
        height: 48,
        content: '100%',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2563EB',
        zIndex: 5,
      },
      {
        id: 's2-c2-h',
        type: 'text',
        x: 375,
        y: 295,
        width: 205,
        height: 28,
        content: 'Google Drive Sync',
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E293B',
        zIndex: 6,
      },
      {
        id: 's2-c2-desc',
        type: 'text',
        x: 375,
        y: 330,
        width: 205,
        height: 80,
        content: 'Sincronización instantánea de archivos .pptx, .potx y .pdf directamente en la nube.',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.4,
        zIndex: 7,
      },
      // Card 3
      {
        id: 's2-card-3',
        type: 'shape',
        shapeType: 'roundedRectangle',
        x: 630,
        y: 150,
        width: 255,
        height: 280,
        fill: '#F8FAFC',
        stroke: '#E2E8F0',
        strokeWidth: 1,
        borderRadius: 14,
        zIndex: 3,
      },
      {
        id: 's2-c3-kpi',
        type: 'text',
        x: 655,
        y: 240,
        width: 205,
        height: 48,
        content: 'Multi-User',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#059669',
        zIndex: 5,
      },
      {
        id: 's2-c3-h',
        type: 'text',
        x: 655,
        y: 295,
        width: 205,
        height: 28,
        content: 'Coautoría en Vivo',
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E293B',
        zIndex: 6,
      },
      {
        id: 's2-c3-desc',
        type: 'text',
        x: 655,
        y: 330,
        width: 205,
        height: 80,
        content: 'Edición conjunta en tiempo real con seguimiento de cursores y comentarios interactivos.',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.4,
        zIndex: 7,
      },
    ],
  },
  {
    id: 'slide-3',
    slideNumber: 3,
    title: 'Hoja de Ruta y Fases de Implementación',
    layout: 'timelineLayout',
    background: {
      type: 'solid',
      color: '#FFFFFF',
    },
    notes: 'Revisar los hitos trimestrales y la compatibilidad con extensiones de productividad.',
    transition: {
      type: 'push',
      duration: 500,
    },
    elements: [
      {
        id: 's3-title',
        type: 'text',
        x: 70,
        y: 45,
        width: 820,
        height: 45,
        content: 'Hoja de Ruta Estratégica',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'left',
        zIndex: 1,
      },
      {
        id: 's3-subtitle',
        type: 'text',
        x: 70,
        y: 95,
        width: 820,
        height: 30,
        content: 'Etapas de despliegue y maduración de la plataforma',
        fontSize: 15,
        color: '#64748B',
        zIndex: 2,
      },
      // Timeline SmartArt
      {
        id: 's3-smartart',
        type: 'smartArt',
        diagramType: 'timeline',
        x: 70,
        y: 150,
        width: 820,
        height: 280,
        zIndex: 3,
        diagramItems: [
          {
            id: 'item-1',
            title: 'Fase 1: Motor Core',
            description: 'Soporte OpenXML (.pptx, .potx, .pptm), visor y renderizador vectorial de alta definición.',
            color: '#C2410C'
          },
          {
            id: 'item-2',
            title: 'Fase 2: Conectividad Nube',
            description: 'Integración nativa con Google Drive, autosave local y coautoría colaborativa.',
            color: '#2563EB'
          },
          {
            id: 'item-3',
            title: 'Fase 3: Automatización',
            description: 'Ejecutor de scripts Office / VBA, marketplace de extensiones e IA Generativa.',
            color: '#7C3AED'
          },
          {
            id: 'item-4',
            title: 'Fase 4: Exportación',
            description: 'Generación de paquetes PDF multipágina, HTML5 autónomo y templates corporativos.',
            color: '#059669'
          }
        ]
      }
    ]
  },
  {
    id: 'slide-4',
    slideNumber: 4,
    title: 'Análisis Comparativo y Distribución',
    layout: 'comparison',
    background: {
      type: 'solid',
      color: '#FFFFFF',
    },
    notes: 'Presentar el gráfico de distribución por formato de archivo y el resumen de compatibilidad.',
    transition: {
      type: 'fade',
      duration: 500,
    },
    elements: [
      {
        id: 's4-title',
        type: 'text',
        x: 70,
        y: 45,
        width: 820,
        height: 45,
        content: 'Compatibilidad de Formatos y Uso',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#0F172A',
        zIndex: 1,
      },
      {
        id: 's4-chart',
        type: 'chart',
        x: 70,
        y: 120,
        width: 440,
        height: 320,
        zIndex: 2,
        chartData: {
          chartType: 'column',
          labels: ['PPTX', 'POTX', 'PPTM', 'PDF', 'HTML5'],
          datasets: [
            {
              label: 'Velocidad de Carga (ms)',
              data: [95, 92, 88, 97, 99],
              colors: ['#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74']
            }
          ]
        }
      },
      {
        id: 's4-table',
        type: 'table',
        x: 530,
        y: 120,
        width: 360,
        height: 320,
        zIndex: 3,
        tableData: [
          [
            { text: 'Formato', fontWeight: 'bold', fill: '#0F172A', color: '#FFFFFF' },
            { text: 'Edición', fontWeight: 'bold', fill: '#0F172A', color: '#FFFFFF' },
            { text: 'Scripts', fontWeight: 'bold', fill: '#0F172A', color: '#FFFFFF' }
          ],
          [
            { text: '.pptx', fontWeight: 'bold' },
            { text: 'Completa', color: '#059669' },
            { text: 'Office Script', color: '#64748B' }
          ],
          [
            { text: '.pptm', fontWeight: 'bold' },
            { text: 'Completa', color: '#059669' },
            { text: 'VBA / JS', color: '#2563EB' }
          ],
          [
            { text: '.potx', fontWeight: 'bold' },
            { text: 'Plantilla', color: '#D97706' },
            { text: 'Habilitado', color: '#64748B' }
          ],
          [
            { text: '.pdf', fontWeight: 'bold' },
            { text: 'Import / Export', color: '#7C3AED' },
            { text: 'Vector HD', color: '#64748B' }
          ]
        ]
      }
    ]
  }
];

export const BLANK_SLIDE: Slide = {
  id: 'slide-1',
  slideNumber: 1,
  title: 'Diapositiva 1',
  layout: 'title',
  background: {
    type: 'solid',
    color: '#FFFFFF',
  },
  elements: [
    {
      id: 'title-1',
      type: 'text',
      x: 120,
      y: 170,
      width: 720,
      height: 90,
      content: 'Haga clic para agregar título',
      fontSize: 44,
      fontWeight: 'bold',
      color: '#1E293B',
      textAlign: 'center',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      zIndex: 1,
    },
    {
      id: 'subtitle-1',
      type: 'text',
      x: 160,
      y: 280,
      width: 640,
      height: 60,
      content: 'Haga clic para agregar subtítulo',
      fontSize: 20,
      color: '#64748B',
      textAlign: 'center',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      zIndex: 2,
    },
  ],
  notes: '',
  transition: {
    type: 'none',
    duration: 500,
  },
  comments: [],
};

export const BLANK_PRESENTATION: Presentation = {
  id: 'presentation-blank',
  title: 'Presentación sin título',
  description: 'Nueva presentación en blanco de PowerPoint.',
  author: 'Usuario',
  version: 1,
  fileFormat: 'pptx',
  aspectRatio: '16:9',
  slides: [BLANK_SLIDE],
  theme: 'office-classic',
  macros: DEFAULT_MACROS,
  comments: [],
  createdAt: '2026-08-26T18:00:00.000Z',
  updatedAt: '2026-08-26T19:50:00.000Z',
};

export const DEMO_PRESENTATION: Presentation = {
  id: 'presentation-welcome',
  title: 'Estrategia de Transformación 2026',
  description: 'Presentación de demostración completa de Microsoft PowerPoint Web Editor.',
  author: 'Director de Innovación',
  version: 1,
  fileFormat: 'pptx',
  aspectRatio: '16:9',
  slides: INITIAL_SLIDES,
  theme: 'office-classic',
  macros: DEFAULT_MACROS,
  comments: [],
  createdAt: '2026-08-26T18:00:00.000Z',
  updatedAt: '2026-08-26T19:50:00.000Z',
};

export const INITIAL_PRESENTATION = BLANK_PRESENTATION;
export const defaultPresentation = BLANK_PRESENTATION;
export const themesList = OFFICE_THEMES;

