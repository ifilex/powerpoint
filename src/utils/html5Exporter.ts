import { Presentation } from '../types/presentation';

export function exportToHtml5(presentation: Presentation): Blob {
  const slidesJson = JSON.stringify(presentation.slides);
  const themeJson = JSON.stringify(presentation.theme);
  const title = presentation.title || 'Presentación HTML5';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - PowerPoint Web Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #090D16;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #stage-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: #000000;
    }
    #slide-viewport {
      width: 960px;
      height: 540px;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      transform-origin: center center;
      transition: opacity 0.4s ease, transform 0.4s ease;
      overflow: hidden;
    }
    .slide-element {
      position: absolute;
      display: flex;
      box-sizing: border-box;
    }
    #control-bar {
      height: 54px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
    }
    .btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFF;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    #notes-drawer {
      position: absolute;
      bottom: 54px;
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding: 16px 24px;
      max-height: 180px;
      overflow-y: auto;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 90;
    }
    #notes-drawer.open {
      transform: translateY(0);
    }
    #laser-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #EF4444;
      box-shadow: 0 0 12px #EF4444, 0 0 24px #EF4444;
      position: fixed;
      pointer-events: none;
      transform: translate(-50%, -50%);
      display: none;
      z-index: 9999;
    }
  </style>
</head>
<body>
  <div id="laser-dot"></div>
  <div id="stage-container">
    <div id="slide-viewport"></div>
    <div id="notes-drawer">
      <div style="font-weight:bold; margin-bottom:6px; color:#94A3B8; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Notas del Orador</div>
      <div id="notes-content" style="font-size:15px; line-height:1.5; color:#E2E8F0;"></div>
    </div>
  </div>

  <div id="control-bar">
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-weight:600; color:#F8FAFC;">${title}</span>
      <span id="slide-counter" style="color:#94A3B8; font-size:13px; margin-left:8px;">1 / 1</span>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="btn" onclick="prevSlide()">◀ Anterior</button>
      <button class="btn" onclick="nextSlide()">Siguiente ▶</button>
      <button class="btn" onclick="toggleNotes()">📝 Notas</button>
      <button class="btn" onclick="toggleLaser()">🔴 Láser</button>
      <button class="btn" onclick="toggleFullscreen()">⛶ Pantalla Completa</button>
    </div>
  </div>

  <script>
    const slides = ${slidesJson};
    const theme = ${themeJson};
    let currentIndex = 0;
    let laserActive = false;
    let notesOpen = false;

    function resizeViewport() {
      const container = document.getElementById('stage-container');
      const viewport = document.getElementById('slide-viewport');
      const w = container.clientWidth - 40;
      const h = container.clientHeight - 40;
      const scale = Math.min(w / 960, h / 540);
      viewport.style.transform = 'scale(' + scale + ')';
    }
    window.addEventListener('resize', resizeViewport);

    function renderSlide(index) {
      const slide = slides[index];
      if (!slide) return;
      const viewport = document.getElementById('slide-viewport');
      viewport.style.opacity = '0';

      setTimeout(() => {
        viewport.innerHTML = '';
        viewport.style.backgroundColor = slide.background?.color || '#FFFFFF';

        slide.elements.forEach(el => {
          const div = document.createElement('div');
          div.className = 'slide-element';
          div.style.left = el.x + 'px';
          div.style.top = el.y + 'px';
          div.style.width = el.width + 'px';
          div.style.height = el.height + 'px';
          div.style.zIndex = el.zIndex || 1;

          if (el.type === 'text') {
            div.style.color = el.color || '#1E293B';
            div.style.fontSize = (el.fontSize || 18) + 'px';
            div.style.fontWeight = el.fontWeight || 'normal';
            div.style.textAlign = el.textAlign || 'left';
            div.style.whiteSpace = 'pre-wrap';
            div.style.lineHeight = el.lineHeight || '1.3';
            div.textContent = el.content || '';
          } else if (el.type === 'shape') {
            div.style.backgroundColor = el.fill || '#3B82F6';
            if (el.shapeType === 'circle') div.style.borderRadius = '50%';
            else if (el.shapeType === 'roundedRectangle') div.style.borderRadius = (el.borderRadius || 12) + 'px';
            if (el.stroke) {
              div.style.border = (el.strokeWidth || 1) + 'px solid ' + el.stroke;
            }
            if (el.opacity !== undefined) div.style.opacity = el.opacity;
          } else if (el.type === 'image' && el.src) {
            const img = document.createElement('img');
            img.src = el.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = el.objectFit || 'contain';
            div.appendChild(img);
          }

          viewport.appendChild(div);
        });

        document.getElementById('slide-counter').textContent = (index + 1) + ' / ' + slides.length;
        document.getElementById('notes-content').textContent = slide.notes || 'Sin notas para esta diapositiva.';
        viewport.style.opacity = '1';
      }, 150);
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        currentIndex++;
        renderSlide(currentIndex);
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        renderSlide(currentIndex);
      }
    }

    function toggleNotes() {
      notesOpen = !notesOpen;
      document.getElementById('notes-drawer').classList.toggle('open', notesOpen);
    }

    function toggleLaser() {
      laserActive = !laserActive;
      document.getElementById('laser-dot').style.display = laserActive ? 'block' : 'none';
    }

    window.addEventListener('mousemove', (e) => {
      if (laserActive) {
        const dot = document.getElementById('laser-dot');
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
      }
    });

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') nextSlide();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
      else if (e.key === 'f' || e.key === 'F5') toggleFullscreen();
      else if (e.key === 'l') toggleLaser();
      else if (e.key === 'n') toggleNotes();
    });

    resizeViewport();
    renderSlide(0);
  </script>
</body>
</html>`;

  return new Blob([html], { type: 'text/html;charset=utf-8' });
}
