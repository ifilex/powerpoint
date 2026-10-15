import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Maximize2,
  Volume2,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  PenTool,
  Grid,
} from 'lucide-react';
import { Slide, Presentation } from '../../types/presentation';

interface PresenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: Presentation;
  initialSlideIndex?: number;
}

export const PresenterModal: React.FC<PresenterModalProps> = ({
  isOpen,
  onClose,
  presentation,
  initialSlideIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [blackScreen, setBlackScreen] = useState(false);

  // Presentation Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  const activeSlide = presentation.slides[currentIndex] || presentation.slides[0];
  const nextSlide = presentation.slides[currentIndex + 1];

  useEffect(() => {
    setCurrentIndex(initialSlideIndex);
    setSecondsElapsed(0);
  }, [isOpen, initialSlideIndex]);

  useEffect(() => {
    let interval: any;
    if (isOpen && timerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timerRunning]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'b' || e.key === 'B') {
        setBlackScreen((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        setLaserActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentIndex < presentation.slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="powerpoint-slideshow-modal"
      className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none overflow-hidden"
      onMouseMove={(e) => {
        if (laserActive) {
          setLaserActive(true);
          setLaserPos({ x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-orange-600 px-2 py-0.5 rounded font-bold">
            {currentIndex + 1} / {presentation.slides.length}
          </span>
          <span>{presentation.title}</span>

          <div className="flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono font-bold">{formatTimer(secondsElapsed)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="ml-1 text-zinc-400 hover:text-white cursor-pointer"
            >
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setSecondsElapsed(0)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
              isPresenterMode ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isPresenterMode ? 'Vista Normal' : 'Vista Moderador'}</span>
          </button>

          <button
            onClick={() => setLaserActive(!laserActive)}
            className={`p-1.5 rounded-lg cursor-pointer transition ${
              laserActive ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
            title="Puntero Láser (L)"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-white transition cursor-pointer"
            title="Finalizar Presentación (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      {blackScreen ? (
        <div
          onClick={() => setBlackScreen(false)}
          className="flex-1 bg-black flex items-center justify-center text-zinc-600 text-sm cursor-pointer"
        >
          Pantalla en negro (Presiona 'B' para reanudar)
        </div>
      ) : isPresenterMode ? (
        /* Presenter Dual View */
        <div className="flex-1 flex p-6 gap-6 pt-16 bg-[#18181B]">
          {/* Main Large Current Slide */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <div
              className="w-full aspect-video rounded-xl shadow-2xl relative overflow-hidden border border-zinc-700"
              style={{ backgroundColor: activeSlide.background?.color || '#FFFFFF' }}
            >
              <div
                className="w-[960px] h-[540px] origin-top-left absolute top-0 left-0 pointer-events-none"
                style={{
                  transform: `scale(${0.7})`,
                }}
              >
                {activeSlide.elements.map((el) => (
                  <div
                    key={el.id}
                    className="absolute"
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      backgroundColor: el.type === 'shape' ? el.fill : undefined,
                      borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                    }}
                  >
                    {el.type === 'text' && (
                      <div
                        style={{
                          fontSize: `${el.fontSize || 18}px`,
                          fontWeight: el.fontWeight || 'normal',
                          color: el.color || '#1E293B',
                          lineHeight: 1.3,
                        }}
                      >
                        {el.content}
                      </div>
                    )}
                    {el.type === 'image' && el.src && (
                      <img src={el.src} alt="" className="w-full h-full object-contain" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold text-zinc-400">
                Diapositiva {currentIndex + 1} de {presentation.slides.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === presentation.slides.length - 1}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Side: Next Slide Preview + Speaker Notes Teleprompter */}
          <div className="w-96 flex flex-col gap-4">
            {/* Next Slide Preview */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Siguiente Diapositiva
              </span>
              {nextSlide ? (
                <div
                  className="aspect-video rounded-lg overflow-hidden border border-zinc-700 relative"
                  style={{ backgroundColor: nextSlide.background?.color || '#FFFFFF' }}
                >
                  <div
                    className="w-[960px] h-[540px] origin-top-left absolute top-0 left-0 pointer-events-none"
                    style={{ transform: 'scale(0.35)' }}
                  >
                    {nextSlide.elements.map((el) => (
                      <div
                        key={el.id}
                        className="absolute"
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          backgroundColor: el.type === 'shape' ? el.fill : undefined,
                        }}
                      >
                        {el.type === 'text' && (
                          <div style={{ fontSize: `${el.fontSize || 18}px`, color: el.color || '#1E293B' }}>
                            {el.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                  Fin de la presentación
                </div>
              )}
            </div>

            {/* Teleprompter Speaker Notes */}
            <div className="flex-1 p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Notas del Orador</span>
              </span>
              <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-zinc-200">
                {activeSlide.notes || 'No hay notas registradas para esta diapositiva.'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Fullscreen Slide */
        <div
          onClick={handleNext}
          className="flex-1 flex items-center justify-center p-8 cursor-pointer relative"
        >
          <div
            className="w-[960px] h-[540px] shadow-2xl relative overflow-hidden"
            style={{
              transform: 'scale(1.2)',
              backgroundColor: activeSlide.background?.color || '#FFFFFF',
            }}
          >
            {activeSlide.elements.map((el) => (
              <div
                key={el.id}
                className="absolute"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  zIndex: el.zIndex || 1,
                  backgroundColor: el.type === 'shape' ? el.fill : undefined,
                  borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                }}
              >
                {el.type === 'text' && (
                  <div
                    style={{
                      fontSize: `${el.fontSize || 18}px`,
                      fontWeight: el.fontWeight || 'normal',
                      fontStyle: el.fontStyle || 'normal',
                      color: el.color || '#1E293B',
                      textAlign: el.textAlign || 'left',
                      lineHeight: el.lineHeight || 1.3,
                      padding: '4px',
                    }}
                  >
                    {el.content}
                  </div>
                )}
                {el.type === 'image' && el.src && (
                  <img src={el.src} alt="" className="w-full h-full object-contain" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Laser Pointer Red Glow Dot */}
      {laserActive && (
        <div
          className="fixed w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_4px_rgba(239,68,68,0.9)] pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
        />
      )}
    </div>
  );
};
