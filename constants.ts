import { Type } from '@google/genai';

export const SYSTEM_INSTRUCTION_JSON = `Eres un asistente de reuniones que recibe una TRANSCRIPCIÓN literal y opcionalmente METADATOS de la reunión.
Tu objetivo: producir un JSON perfectamente válido con la síntesis y tareas accionables, siguiendo el esquema dado.
Reglas de oro:
- NO inventes datos. Si falta algo, usa null o "No mencionado".
- Mantén nombres propios y términos técnicos tal como aparecen.
- Identifica decisiones, riesgos, bloqueos, dependencias y responsables cuando estén explícitos.
- Extrae tareas con formato consistente y priorización (alta/media/baja). Si no hay fecha, due=null.
- Respeta el idioma de salida {{output_language}}. La transcripción puede estar en varios idiomas.
- Fechas en ISO 8601 con TZ {{timezone}}. Si el texto dice “el viernes”, infiere próxima fecha futura si es inequívoco; si no, due=null.
- No devuelvas texto fuera del JSON. Nada de comentarios, ni markdown.
- Copia la transcripción íntegra en el campo transcript (tal cual, sin “limpiar”).
- Secciones obligatorias del resumen: 1) Proyectos actuales, 2) Nuevas ideas y oportunidades, 3) Me guardo Notion, 4) Consideraciones técnicas, 5) Próximos pasos, 6) Notas, 7) Transcripción íntegra.
- Si no hay elementos para una sección, devuelve un array vacío o "No mencionado" según corresponda.
- Detecta y normaliza tareas: verbo en infinitivo + objeto, asigna owner (si no se menciona, usa {{default_owner}}), y prioridad según urgencia/impacto inferido.
- No repitas frases idénticas del transcript en el executive_summary; sintetiza.`;

export const SYSTEM_INSTRUCTION_MARKDOWN = `Eres un asistente de reuniones. A partir de la transcripción, devuelve SOLO Markdown con estas secciones:

# Resumen Ejecutivo
- Bullets claros con lo esencial.
- Decisiones (quién/cuándo/por qué).
- Riesgos y mitigaciones.

# Proyectos actuales
(Lista con nombre, estado, owner, notas)

# Nuevas ideas y oportunidades
(Lista con idea, valor, esfuerzo, próximo paso)

# Me guardo Notion
(Lista de páginas/espacios donde archivar; si no hay, sugerencias)

# Consideraciones técnicas
(Temas, detalles y preguntas abiertas)

# Próximos pasos
(Tabla: Tarea | Owner | Fecha | Prioridad | Dependencias)

# Notas
(Texto libre para apuntes)

# Transcripción (copia literal)
(Bloque de texto)

Reglas: No inventes. Marca “No mencionado” donde falte. Fechas ISO 8601 TZ {{timezone}}. Idioma {{output_language}}.`;


export const RESPONSE_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        executive_summary: { type: Type.STRING },
        key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
        decisions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              decision: { type: Type.STRING },
              who: { type: Type.STRING },
              when: { type: [Type.STRING, Type.NULL] },
              rationale: { type: [Type.STRING, Type.NULL] }
            },
            required: ["decision","who"]
          }
        },
        risks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              risk: { type: Type.STRING },
              impact: { type: Type.STRING },
              mitigation: { type: [Type.STRING, Type.NULL] }
            },
            required: ["risk","impact"]
          }
        }
      },
      required: ["executive_summary","key_points","decisions","risks"]
    },
    projects_current: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          status: { type: Type.STRING },
          owner: { type: Type.STRING },
          notes: { type: [Type.STRING, Type.NULL] }
        },
        required: ["name","status","owner"]
      }
    },
    new_ideas_opportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          idea: { type: Type.STRING },
          value: { type: [Type.STRING, Type.NULL] },
          effort: { type: [Type.STRING, Type.NULL] },
          next_step: { type: [Type.STRING, Type.NULL] }
        },
        required: ["idea"]
      }
    },
    saved_to_notion: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          page: { type: Type.STRING },
          url: { type: [Type.STRING, Type.NULL] },
          note: { type: [Type.STRING, Type.NULL] }
        },
        required: ["page"]
      }
    },
    technical_considerations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          details: { type: Type.STRING },
          open_questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["topic","details","open_questions"]
      }
    },
    next_steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          owner: { type: Type.STRING },
          due: { type: [Type.STRING, Type.NULL] },
          priority: { type: Type.STRING, enum: ["alta","media","baja"] },
          dependencies: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["task","owner","priority","dependencies"]
      }
    },
    notes: { type: Type.STRING },
    transcript: { type: Type.STRING }
  },
  required: [
    "summary",
    "projects_current",
    "new_ideas_opportunities",
    "saved_to_notion",
    "technical_considerations",
    "next_steps",
    "notes",
    "transcript"
  ]
};