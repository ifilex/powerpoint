import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Could not initialize Gemini AI client:", e);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Assistant Route for Presentations
  app.post("/api/ai/generate-presentation", async (req, res) => {
    try {
      const { prompt, slideCount = 4, tone = "professional", language = "es" } = req.body;
      const ai = getAI();

      if (!ai) {
        // Return a high quality structured presentation template if API key is not configured
        return res.json({
          slides: [
            {
              title: prompt || "Estrategia Empresarial y Visión 2026",
              subtitle: "Innovación, Crecimiento y Transformación Digital",
              elements: [
                {
                  type: "text",
                  content: prompt ? `Presentación ejecutiva: ${prompt}` : "Visión Estratégica",
                  x: 80,
                  y: 120,
                  width: 800,
                  height: 100,
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#1E293B",
                  textAlign: "center"
                },
                {
                  type: "text",
                  content: "Resumen de objetivos principales, métricas de impacto y hoja de ruta.",
                  x: 100,
                  y: 240,
                  width: 760,
                  height: 80,
                  fontSize: 20,
                  color: "#64748B",
                  textAlign: "center"
                }
              ],
              background: "#F8FAFC",
              notes: "Introducir la visión del proyecto y dar la bienvenida al equipo."
            },
            {
              title: "Pilares Clave y Metas",
              elements: [
                {
                  type: "text",
                  content: "1. Eficiencia Operativa\n2. Crecimiento Acelerado\n3. Experiencia de Usuario\n4. Seguridad y Escalabilidad",
                  x: 80,
                  y: 140,
                  width: 380,
                  height: 260,
                  fontSize: 20,
                  color: "#1E293B"
                },
                {
                  type: "shape",
                  shapeType: "rectangle",
                  x: 500,
                  y: 140,
                  width: 380,
                  height: 240,
                  fill: "#3B82F6",
                  opacity: 0.15,
                  borderRadius: 12
                },
                {
                  type: "text",
                  content: "Impacto Proyectado:\n+45% Productividad\n-30% Tiempo de entrega\n99.9% Disponibilidad",
                  x: 520,
                  y: 170,
                  width: 340,
                  height: 180,
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#1D4ED8"
                }
              ],
              background: "#FFFFFF",
              notes: "Destacar los 4 pilares fundamentales y el impacto numérico."
            }
          ]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Eres un diseñador experto en PowerPoint y presentaciones ejecutivas de nivel Fortune 500.
Genera un mazo de ${slideCount} diapositivas en idioma ${language} basado en el siguiente tema: "${prompt}".
Tono: ${tone}.

Devuelve ÚNICAMENTE un JSON válido sin markdown ni comillas triples con este esquema:
{
  "slides": [
    {
      "title": "Título de la diapositiva",
      "background": "#HexColor",
      "notes": "Notas del orador detalladas",
      "elements": [
        {
          "type": "text" | "shape",
          "content": "Texto del elemento",
          "x": number (entre 50 y 850),
          "y": number (entre 50 y 480),
          "width": number,
          "height": number,
          "fontSize": number,
          "fontWeight": "normal" | "bold",
          "color": "#HexColor",
          "textAlign": "left" | "center" | "right",
          "shapeType": "rectangle" | "circle" | "callout" | "card",
          "fill": "#HexColor",
          "borderRadius": number
        }
      ]
    }
  ]
}`
      });

      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (error: any) {
      console.error("AI Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate presentation" });
    }
  });

  // AI Slide Content Refiner
  app.post("/api/ai/enhance-text", async (req, res) => {
    try {
      const { text, action = "improve" } = req.body;
      const ai = getAI();

      if (!ai) {
        let result = text;
        if (action === "summarize") result = `• Resumen clave: ${text.slice(0, 100)}...`;
        else if (action === "bullets") result = text.split(". ").map((s: string) => `• ${s.trim()}`).join("\n");
        else result = `✦ ${text} (Optimizado para impacto)`;
        return res.json({ result });
      }

      const promptMap: Record<string, string> = {
        improve: `Mejora y haz más persuasivo, conciso y profesional el siguiente texto para una diapositiva: "${text}"`,
        summarize: `Sintetiza en 2 viñetas ejecutivas de alto impacto el siguiente texto: "${text}"`,
        bullets: `Transforma el siguiente texto en puntos clave atractivos para PowerPoint: "${text}"`,
        translate_en: `Translate the following presentation text to clear, polished English: "${text}"`,
        translate_es: `Traduce el siguiente texto a español neutro y profesional: "${text}"`
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptMap[action] || promptMap.improve
      });

      res.json({ result: response.text?.trim() || text });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Office PowerPoint Web Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
