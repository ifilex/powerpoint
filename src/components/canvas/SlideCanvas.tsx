import React, { useRef, useState, useEffect } from 'react';
import {
  Slide,
  SlideElement,
  CollaborationUser,
  ShapeType,
  PresentationTheme,
} from '../../types/presentation';
import { Sparkles, Trash2, RotateCw, Lock, Move, MessageSquare } from 'lucide-react';

interface SlideCanvasProps {
  slide: Slide;
  theme: PresentationTheme;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onDeleteElement: (id: string) => void;
  zoom: number;
  isDarkMode: boolean;
  activeUsers: CollaborationUser[];
  onCursorMove: (x: number, y: number) => void;
  drawMode: 'none' | 'pen' | 'highlighter' | 'eraser';
  drawColor: string;
  drawWidth: number;
  onAddDrawingPoint?: (points: { x: number; y: number }[]) => void;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  theme,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  zoom,
  isDarkMode,
  activeUsers,
  onCursorMove,
  drawMode,
  drawColor,
  drawWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Dragging and Resizing State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialElRect, setInitialElRect] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  // Alignment Guidelines Snap Lines
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});

  // Drawing mode freehand path state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPath, setCurrentDrawPath] = useState<{ x: number; y: number }[]>([]);

  // Text inline editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId);

  // Mouse move handler for canvas stage
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!slideRef.current) return;
    const rect = slideRef.current.getBoundingClientRect();
    const scale = (zoom / 100);
    const canvasX = Math.round((e.clientX - rect.left) / scale);
    const canvasY = Math.round((e.clientY - rect.top) / scale);

    onCursorMove(canvasX, canvasY);

    // Freehand Drawing
    if (drawMode !== 'none' && isDrawing) {
      setCurrentDrawPath((prev) => [...prev, { x: canvasX, y: canvasY }]);
      return;
    }

    // Element Dragging
    if (isDragging && selectedElement) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;

      let newX = Math.round(initialElRect.x + dx);
      let newY = Math.round(initialElRect.y + dy);

      // Snap to Center Guidelines (960x540 -> Center X: 480, Center Y: 270)
      const elCenterX = newX + selectedElement.width / 2;
      const elCenterY = newY + selectedElement.height / 2;
      const newSnap: { x?: number; y?: number } = {};

      if (Math.abs(elCenterX - 480) < 12) {
        newX = 480 - selectedElement.width / 2;
        newSnap.x = 480;
      }
      if (Math.abs(elCenterY - 270) < 12) {
        newY = 270 - selectedElement.height / 2;
        newSnap.y = 270;
      }

      setSnapLines(newSnap);
      onUpdateElement(selectedElement.id, { x: newX, y: newY });
    }

    // Element Resizing
    if (isResizing && selectedElement) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;

      let newW = initialElRect.w;
      let newH = initialElRect.h;
      let newX = initialElRect.x;
      let newY = initialElRect.y;

      if (isResizing.includes('r')) newW = Math.max(40, initialElRect.w + dx);
      if (isResizing.includes('b')) newH = Math.max(25, initialElRect.h + dy);
      if (isResizing.includes('l')) {
        const potentialW = initialElRect.w - dx;
        if (potentialW >= 40) {
          newW = potentialW;
          newX = initialElRect.x + dx;
        }
      }
      if (isResizing.includes('t')) {
        const potentialH = initialElRect.h - dy;
        if (potentialH >= 25) {
          newH = potentialH;
          newY = initialElRect.y + dy;
        }
      }

      onUpdateElement(selectedElement.id, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
    setSnapLines({});

    if (isDrawing && currentDrawPath.length > 1) {
      // Save drawing path as element
      const newDrawEl: SlideElement = {
        id: `draw-${Date.now()}`,
        type: 'draw',
        x: 0,
        y: 0,
        width: 960,
        height: 540,
        zIndex: slide.elements.length + 1,
        points: currentDrawPath,
        color: drawColor,
        strokeWidth: drawWidth,
        drawTool: drawMode === 'highlighter' ? 'highlighter' : 'pen',
        opacity: drawMode === 'highlighter' ? 0.4 : 1,
      };
      onUpdateElement(`draw-${Date.now()}`, newDrawEl);
      setIsDrawing(false);
      setCurrentDrawPath([]);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    if (drawMode !== 'none') return;

    onSelectElement(el.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialElRect({ x: el.x, y: el.y, w: el.width, h: el.height });
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;
    setIsResizing(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialElRect({
      x: selectedElement.x,
      y: selectedElement.y,
      w: selectedElement.width,
      h: selectedElement.height,
    });
  };

  return (
    <main
      id="slide-stage-viewport"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => onSelectElement(null)}
      className={`flex-1 overflow-auto flex items-center justify-center p-8 select-none relative transition-colors ${
        isDarkMode ? 'bg-[#121214]' : 'bg-[#E5E7EB]'
      }`}
    >
      {/* 16:9 Standard Presentation Slide Canvas (960 x 540) */}
      <div
        id={`slide-canvas-${slide.id}`}
        ref={slideRef}
        onMouseDown={(e) => {
          if (drawMode !== 'none') {
            setIsDrawing(true);
            const rect = slideRef.current?.getBoundingClientRect();
            if (rect) {
              const scale = zoom / 100;
              const canvasX = Math.round((e.clientX - rect.left) / scale);
              const canvasY = Math.round((e.clientY - rect.top) / scale);
              setCurrentDrawPath([{ x: canvasX, y: canvasY }]);
            }
          }
        }}
        className="w-[960px] h-[540px] relative shadow-2xl transition-transform origin-center overflow-hidden shrink-0"
        style={{
          transform: `scale(${zoom / 100})`,
          backgroundColor: slide.background?.color || theme.backgroundColor || '#FFFFFF',
          cursor:
            drawMode === 'pen'
              ? 'crosshair'
              : drawMode === 'highlighter'
              ? 'crosshair'
              : drawMode === 'eraser'
              ? 'cell'
              : 'default',
        }}
      >
        {/* Render Slide Elements */}
        {slide.elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          const isEditing = editingTextId === el.id;

          return (
            <div
              key={el.id}
              id={`canvas-el-${el.id}`}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === 'text') setEditingTextId(el.id);
              }}
              className={`absolute group transition-shadow ${
                isSelected ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:ring-1 hover:ring-orange-300'
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                zIndex: el.zIndex || 1,
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: el.opacity !== undefined ? el.opacity : 1,
              }}
            >
              {/* === TYPE: TEXT === */}
              {el.type === 'text' && (
                <div className="w-full h-full p-2 flex flex-col justify-center">
                  {isEditing ? (
                    <textarea
                      value={el.content || ''}
                      onChange={(e) => onUpdateElement(el.id, { content: e.target.value })}
                      onBlur={() => setEditingTextId(null)}
                      autoFocus
                      className="w-full h-full bg-transparent resize-none outline-none border border-dashed border-orange-500 rounded p-1"
                      style={{
                        fontSize: `${el.fontSize || 18}px`,
                        fontFamily: el.fontFamily || theme.fontBody,
                        fontWeight: el.fontWeight || 'normal',
                        fontStyle: el.fontStyle || 'normal',
                        textDecoration: el.textDecoration || 'none',
                        color: el.color || theme.textColor,
                        textAlign: el.textAlign || 'left',
                        lineHeight: el.lineHeight || 1.3,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full select-text whitespace-pre-wrap break-words"
                      style={{
                        fontSize: `${el.fontSize || 18}px`,
                        fontFamily: el.fontFamily || theme.fontBody,
                        fontWeight: el.fontWeight || 'normal',
                        fontStyle: el.fontStyle || 'normal',
                        textDecoration: el.textDecoration || 'none',
                        color: el.color || theme.textColor,
                        textAlign: el.textAlign || 'left',
                        lineHeight: el.lineHeight || 1.3,
                      }}
                    >
                      {el.content || 'Haga clic para agregar texto'}
                    </div>
                  )}
                </div>
              )}

              {/* === TYPE: SHAPE === */}
              {el.type === 'shape' && (
                <div
                  className="w-full h-full flex items-center justify-center transition-all overflow-hidden"
                  style={{
                    backgroundColor: el.fill || '#3B82F6',
                    borderRadius:
                      el.shapeType === 'circle'
                        ? '50%'
                        : el.shapeType === 'roundedRectangle'
                        ? `${el.borderRadius || 16}px`
                        : `${el.borderRadius || 0}px`,
                    border: el.stroke ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined,
                  }}
                >
                  {el.content && (
                    <span
                      style={{
                        color: el.color || '#FFFFFF',
                        fontSize: `${el.fontSize || 16}px`,
                        fontWeight: el.fontWeight || 'bold',
                      }}
                    >
                      {el.content}
                    </span>
                  )}
                </div>
              )}

              {/* === TYPE: IMAGE === */}
              {el.type === 'image' && el.src && (
                <img
                  src={el.src}
                  alt={el.altText || 'Imagen'}
                  className="w-full h-full pointer-events-none rounded"
                  style={{ objectFit: el.objectFit || 'contain' }}
                />
              )}

              {/* === TYPE: TABLE === */}
              {el.type === 'table' && el.tableData && (
                <div className="w-full h-full overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs">
                  <table className="w-full h-full border-collapse text-xs">
                    <tbody>
                      {el.tableData.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-zinc-200 dark:border-zinc-800">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-2 border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                              style={{
                                backgroundColor: cell.fill,
                                color: cell.color,
                                fontWeight: cell.fontWeight || 'normal',
                                textAlign: cell.textAlign || 'left',
                              }}
                            >
                              <input
                                type="text"
                                value={cell.text}
                                onChange={(e) => {
                                  const newData = [...el.tableData!];
                                  newData[rIdx][cIdx].text = e.target.value;
                                  onUpdateElement(el.id, { tableData: newData });
                                }}
                                className="w-full bg-transparent border-none outline-none font-inherit text-inherit"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* === TYPE: CHART === */}
              {el.type === 'chart' && el.chartData && (
                <div className="w-full h-full p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    <span>{el.chartData.datasets[0]?.label || 'Gráfico'}</span>
                    <span className="text-[10px] text-zinc-400">Datos Dinámicos</span>
                  </div>
                  {/* Visual SVG Chart */}
                  <div className="flex-1 flex items-end justify-around gap-2 pt-2 border-b border-zinc-200 dark:border-zinc-700">
                    {el.chartData.labels.map((label, idx) => {
                      const val = el.chartData!.datasets[0]?.data[idx] || 50;
                      const maxVal = Math.max(...(el.chartData!.datasets[0]?.data || [100]));
                      const heightPct = Math.round((val / (maxVal || 1)) * 100);
                      const color =
                        el.chartData!.datasets[0]?.colors?.[idx] || theme.primaryColor || '#C43E1C';

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                          <span className="text-[10px] font-bold mb-1 opacity-80">{val}</span>
                          <div
                            className="w-full rounded-t-md transition-all group-hover:brightness-110"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: color,
                            }}
                          />
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1 truncate w-full text-center">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* === TYPE: SMARTART DIAGRAM === */}
              {el.type === 'smartArt' && el.diagramItems && (
                <div className="w-full h-full p-4 bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-between gap-3">
                  {el.diagramItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800 flex flex-col justify-between h-full shadow-xs"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0"
                          style={{ backgroundColor: item.color || theme.primaryColor }}
                        >
                          {idx + 1}
                        </div>
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-hidden">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* === TYPE: QR CODE === */}
              {el.type === 'qrcode' && (
                <div className="w-full h-full p-2 bg-white rounded-lg shadow-sm border border-zinc-200 flex flex-col items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      el.qrValue || 'https://google.com'
                    )}`}
                    alt="QR Code"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}

              {/* === TYPE: DIGITAL DRAWING INK === */}
              {el.type === 'draw' && el.points && (
                <svg className="w-full h-full pointer-events-none absolute inset-0">
                  <polyline
                    points={el.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={el.color || '#EF4444'}
                    strokeWidth={el.strokeWidth || 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={el.opacity || 1}
                  />
                </svg>
              )}

              {/* Selection Handles (8 cardinal points + Rotate) */}
              {isSelected && (
                <>
                  <div
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-nwse-resize shadow-xs z-50"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, 'tl')}
                  />
                  <div
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-nesw-resize shadow-xs z-50"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, 'tr')}
                  />
                  <div
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-nesw-resize shadow-xs z-50"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, 'bl')}
                  />
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-nwse-resize shadow-xs z-50"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, 'br')}
                  />
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-ns-resize shadow-xs z-50"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, 't')}
                  />
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-orange-500 rounded-full cursor-ns-resize shadow-xs z-50"
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, 'b')}
                  />

                  {/* Delete Button floating chip */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(el.id);
                    }}
                    className="absolute -top-7 right-0 p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 cursor-pointer"
                    title="Eliminar elemento (Del)"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {/* Temporary Freehand Drawing Stroke */}
        {isDrawing && currentDrawPath.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
            <polyline
              points={currentDrawPath.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={drawColor}
              strokeWidth={drawWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={drawMode === 'highlighter' ? 0.4 : 1}
            />
          </svg>
        )}

        {/* Real-time Magnetic Snap Guidelines */}
        {snapLines.x && (
          <div
            className="absolute top-0 bottom-0 w-[1.5px] bg-red-500 z-40 pointer-events-none"
            style={{ left: `${snapLines.x}px` }}
          />
        )}
        {snapLines.y && (
          <div
            className="absolute left-0 right-0 h-[1.5px] bg-red-500 z-40 pointer-events-none"
            style={{ top: `${snapLines.y}px` }}
          />
        )}

        {/* Collaborators Live Cursors on Slide */}
        {activeUsers
          .filter((u) => u.currentSlideId === slide.id && u.cursor)
          .map((u) => (
            <div
              key={u.id}
              className="absolute pointer-events-none z-50 flex items-center gap-1 transition-all duration-75"
              style={{
                left: `${u.cursor!.x}px`,
                top: `${u.cursor!.y}px`,
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={u.color}>
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-md whitespace-nowrap"
                style={{ backgroundColor: u.color }}
              >
                {u.name.split(' ')[0]}
              </span>
            </div>
          ))}
      </div>
    </main>
  );
};
