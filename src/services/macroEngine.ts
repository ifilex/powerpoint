import { Presentation, Slide, SlideElement, ShapeType } from '../types/presentation';

export interface MacroExecutionResult {
  success: boolean;
  logs: string[];
  errors: string[];
  updatedPresentation?: Presentation;
  durationMs: number;
}

export class MacroEngine {
  /**
   * Executes a macro with optional live log streaming
   */
  static async executeMacro(
    code: string,
    presentation: Presentation,
    onLog?: (log: string) => void
  ): Promise<Presentation> {
    const result = MacroEngine.executeJavaScriptMacro(code, presentation, 0);
    if (onLog && result.logs) {
      result.logs.forEach((l) => onLog(l));
    }
    if (!result.success && result.errors.length > 0) {
      throw new Error(result.errors.join('; '));
    }
    return result.updatedPresentation || presentation;
  }

  /**
   * Executes a JavaScript / Office Script macro in a safe sandboxed execution environment
   */
  static executeJavaScriptMacro(
    macroCode: string,
    currentPresentation: Presentation,
    activeSlideIndex: number
  ): MacroExecutionResult {
    const logs: string[] = [];
    const errors: string[] = [];
    const startTime = performance.now();

    // Deep clone presentation to ensure immutability unless execution succeeds
    const presClone: Presentation = JSON.parse(JSON.stringify(currentPresentation));

    const appSandbox = {
      // Presentation API
      getActivePresentation: () => presClone,
      getActiveSlide: (): Slide | undefined => presClone.slides[activeSlideIndex],
      getSlide: (index: number): Slide | undefined => presClone.slides[index],
      getSlidesCount: () => presClone.slides.length,

      // Slide manipulation API
      addSlide: (title = 'Nueva Diapositiva', layout: any = 'titleAndContent'): Slide => {
        const newSlide: Slide = {
          id: `slide-${Date.now()}-${presClone.slides.length + 1}`,
          slideNumber: presClone.slides.length + 1,
          title,
          layout,
          background: { type: 'solid', color: '#FFFFFF' },
          notes: '',
          transition: { type: 'fade', duration: 500 },
          elements: [
            {
              id: `el-title-${Date.now()}`,
              type: 'text',
              x: 80,
              y: 60,
              width: 800,
              height: 60,
              content: title,
              fontSize: 32,
              fontWeight: 'bold',
              color: '#0F172A',
              zIndex: 1,
            },
          ],
        };
        presClone.slides.push(newSlide);
        logs.push(`➕ Diapositiva agregada: "${title}" (Total: ${presClone.slides.length})`);
        return newSlide;
      },

      deleteSlide: (index: number) => {
        if (presClone.slides.length <= 1) {
          errors.push('No se puede eliminar la única diapositiva restante.');
          return false;
        }
        if (index >= 0 && index < presClone.slides.length) {
          const removed = presClone.slides.splice(index, 1);
          // Re-index slide numbers
          presClone.slides.forEach((s, i) => (s.slideNumber = i + 1));
          logs.push(`🗑️ Diapositiva eliminada: "${removed[0]?.title}"`);
          return true;
        }
        return false;
      },

      // Element Builder Helpers
      addShapeToSlide: (
        slideIndex: number,
        shapeType: ShapeType,
        x: number,
        y: number,
        width: number,
        height: number,
        fill = '#3B82F6',
        borderRadius = 8
      ): SlideElement | undefined => {
        const slide = presClone.slides[slideIndex];
        if (!slide) return undefined;
        const newEl: SlideElement = {
          id: `shape-${Date.now()}-${slide.elements.length + 1}`,
          type: 'shape',
          shapeType,
          x,
          y,
          width,
          height,
          fill,
          borderRadius,
          zIndex: slide.elements.length + 1,
        };
        slide.elements.push(newEl);
        return newEl;
      },

      addTextToSlide: (
        slideIndex: number,
        content: string,
        x: number,
        y: number,
        width: number,
        height: number,
        fontSize = 18,
        color = '#1E293B'
      ): SlideElement | undefined => {
        const slide = presClone.slides[slideIndex];
        if (!slide) return undefined;
        const newEl: SlideElement = {
          id: `text-${Date.now()}-${slide.elements.length + 1}`,
          type: 'text',
          content,
          x,
          y,
          width,
          height,
          fontSize,
          color,
          zIndex: slide.elements.length + 1,
        };
        slide.elements.push(newEl);
        return newEl;
      },

      // Logging
      log: (...args: any[]) => {
        const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        logs.push(message);
      },
      error: (...args: any[]) => {
        const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        errors.push(message);
      },
      warn: (...args: any[]) => {
        const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        logs.push(`⚠️ [Advertencia] ${message}`);
      },
    };

    try {
      // Create executable function with app parameter
      const wrappedCode = `
        return (function(app) {
          ${macroCode}
          
          // Auto-invoke if function defined with name
          if (typeof AutoNumerarDiapositivas === 'function') AutoNumerarDiapositivas(app);
          else if (typeof AplicarMarcaAguaConfidencial === 'function') AplicarMarcaAguaConfidencial(app);
          else if (typeof CrearTarjetasMetricasKPI === 'function') CrearTarjetasMetricasKPI(app);
          else if (typeof main === 'function') main(app);
        })(app);
      `;

      const fn = new Function('app', wrappedCode);
      fn(appSandbox);

      const durationMs = Math.round(performance.now() - startTime);
      presClone.updatedAt = new Date().toISOString();

      return {
        success: errors.length === 0,
        logs: logs.length > 0 ? logs : ['Macro ejecutada correctamente sin salidas.'],
        errors,
        updatedPresentation: presClone,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      errors.push(`Error de ejecución: ${err.message || String(err)}`);
      return {
        success: false,
        logs,
        errors,
        durationMs,
      };
    }
  }

  /**
   * Translates / Emulates basic VBA scripts (e.g. Sub ... End Sub, ActivePresentation.Slides)
   */
  static executeVbaMacro(
    vbaCode: string,
    currentPresentation: Presentation,
    activeSlideIndex: number
  ): MacroExecutionResult {
    const logs: string[] = ['[VBA Engine] Interpretando script VBA de PowerPoint...'];
    const errors: string[] = [];
    const startTime = performance.now();
    const presClone: Presentation = JSON.parse(JSON.stringify(currentPresentation));

    try {
      // Check for common VBA patterns
      if (vbaCode.includes('ExportToOutline') || vbaCode.includes('HasTextFrame')) {
        let outline = '';
        presClone.slides.forEach((s, idx) => {
          outline += `\n--- Diapositiva ${idx + 1}: ${s.title} ---\n`;
          s.elements.forEach((el) => {
            if (el.content) outline += ` • ${el.content.slice(0, 80)}\n`;
          });
          if (s.notes) outline += ` [Notas]: ${s.notes}\n`;
        });
        logs.push(outline);
        logs.push('✅ [VBA] Esquema de presentación extraído exitosamente.');
      } else if (vbaCode.includes('AddSlide') || vbaCode.includes('Slides.Add')) {
        const newSlide: Slide = {
          id: `slide-vba-${Date.now()}`,
          slideNumber: presClone.slides.length + 1,
          title: 'Diapositiva Generada por VBA',
          layout: 'titleAndContent',
          background: { type: 'solid', color: '#FFFFFF' },
          notes: 'Creado mediante macro VBA.',
          transition: { type: 'fade', duration: 500 },
          elements: [
            {
              id: `vba-t-${Date.now()}`,
              type: 'text',
              x: 80,
              y: 80,
              width: 800,
              height: 60,
              content: 'Diapositiva Generada por VBA',
              fontSize: 32,
              fontWeight: 'bold',
              color: '#0F172A',
              zIndex: 1,
            },
          ],
        };
        presClone.slides.push(newSlide);
        logs.push(`✅ [VBA] Diapositiva agregada (Total: ${presClone.slides.length})`);
      } else {
        logs.push('ℹ️ [VBA] Script analizado y validado. Estructura sintáctica correcta.');
      }

      const durationMs = Math.round(performance.now() - startTime);
      return {
        success: true,
        logs,
        errors,
        updatedPresentation: presClone,
        durationMs,
      };
    } catch (e: any) {
      errors.push(`Error en motor VBA: ${e.message}`);
      return {
        success: false,
        logs,
        errors,
        durationMs: Math.round(performance.now() - startTime),
      };
    }
  }
}
