export type ElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'table'
  | 'chart'
  | 'qrcode'
  | 'icon'
  | 'draw'
  | 'smartArt';

export type ShapeType =
  | 'rectangle'
  | 'roundedRectangle'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'arrowRight'
  | 'arrowLeft'
  | 'arrowUp'
  | 'arrowDown'
  | 'callout'
  | 'cloud'
  | 'heart'
  | 'badge'
  | 'line'
  | 'card';

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'push'
  | 'wipe'
  | 'zoom'
  | 'flip'
  | 'morph'
  | 'cube';

export type AnimationType =
  | 'none'
  | 'fadeIn'
  | 'flyIn'
  | 'zoomIn'
  | 'bounceIn'
  | 'pulse'
  | 'spin'
  | 'fadeOut';

export interface ElementAnimation {
  type: AnimationType;
  delay: number; // in seconds
  duration: number; // in seconds
  trigger: 'click' | 'afterPrevious' | 'withPrevious';
  order: number;
}

export interface TableCell {
  text: string;
  fill?: string;
  color?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ChartData {
  chartType?: 'bar' | 'column' | 'line' | 'pie' | 'doughnut' | string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    colors?: string[];
  }[];
}

export interface SmartArtItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  opacity?: number;
  locked?: boolean;
  hidden?: boolean;

  // Text properties
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string; // 'normal' | 'bold' | '600' | '700'
  fontStyle?: string; // 'normal' | 'italic'
  textDecoration?: string; // 'none' | 'underline' | 'line-through'
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;

  // Shape properties
  shapeType?: ShapeType;
  fill?: string;
  fillGradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  borderRadius?: number;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };

  // Image properties
  src?: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  altText?: string;
  filter?: {
    brightness?: number;
    contrast?: number;
    blur?: number;
    grayscale?: number;
  };

  // Icon properties
  iconName?: string;

  // Table properties
  tableData?: TableCell[][];
  tableColWidths?: number[];

  // Chart properties
  chartData?: ChartData;

  // QR Code properties
  qrValue?: string;
  qrFgColor?: string;
  qrBgColor?: string;

  // Freehand Drawing Path properties
  points?: { x: number; y: number }[];
  drawTool?: 'pen' | 'highlighter';

  // SmartArt Diagram properties
  diagramType?: 'process' | 'timeline' | 'hierarchy' | 'swot' | 'funnel' | 'matrix' | 'cards';
  diagramItems?: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    color?: string;
  }[];

  // Animation
  animation?: ElementAnimation;
}

export type SlideLayout =
  | 'title'
  | 'titleAndContent'
  | 'sectionHeader'
  | 'twoColumns'
  | 'comparison'
  | 'titleOnly'
  | 'blank'
  | 'contentWithCaption'
  | 'pictureWithCaption'
  | 'quote'
  | 'kpiDashboard'
  | 'timelineLayout';

export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  layout: SlideLayout;
  background?: {
    type?: 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: string;
    image?: string;
  };
  elements: SlideElement[];
  notes?: string;
  transition?: {
    type: TransitionType;
    duration: number; // in ms
  };
  hidden?: boolean;
  comments?: any[];
}


export interface PresentationTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  fontHeading: string;
  fontBody: string;
  isDark?: boolean;
}

export interface CommentReply {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface SlideComment {
  id: string;
  slideId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  position: { x: number; y: number };
  resolved: boolean;
  replies: CommentReply[];
}

export interface MacroScript {
  id: string;
  name: string;
  description?: string;
  language: 'javascript' | 'vba';
  code: string;
  lastRun?: string;
  isCustom?: boolean;
}


export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  currentSlideId: string;
  cursor: { x: number; y: number } | null;
  selectedElementId: string | null;
  lastActive: number;
  isHost?: boolean;
}

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  author?: string;
  version?: number;
  fileFormat: 'pptx' | 'potx' | 'pptm';
  aspectRatio: '16:9' | '4:3' | 'A4';
  slides: Slide[];
  theme: PresentationTheme | string;
  macros: MacroScript[];
  comments?: SlideComment[];
  createdAt: string;
  updatedAt: string;
  googleDriveFileId?: string;
  googleDriveSyncTime?: string;
}


export type ActiveRibbonTab =
  | 'file'
  | 'home'
  | 'insert'
  | 'draw'
  | 'design'
  | 'transitions'
  | 'animations'
  | 'slideshow'
  | 'review'
  | 'view'
  | 'extensions'
  | 'developer';

export type ActiveViewMode = 'normal' | 'sorter' | 'reading' | 'slideshow' | 'presenter';
