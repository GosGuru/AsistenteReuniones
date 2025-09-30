import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION_JSON, SYSTEM_INSTRUCTION_MARKDOWN, RESPONSE_JSON_SCHEMA } from '../constants';
import type { SummaryData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

interface SummaryParams {
  transcript: string;
  meetingTitle?: string;
  attendees?: string[];
  defaultOwner?: string;
  outputLanguage?: string;
  timezone?: string;
}

function handleApiError(error: unknown, context: 'generación de resumen' | 'transcripción'): Error {
    console.error(`Error durante ${context}:`, error);

    let message = `Ocurrió un error inesperado durante la ${context}. Por favor, inténtalo de nuevo más tarde.`;

    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('api key not valid')) {
            message = 'Falló la autenticación. La clave de API proporcionada es inválida o no existe.';
        } else if (error.message.toLowerCase().includes('rate limit')) {
            message = 'Has realizado demasiadas solicitudes en un corto período. Por favor, espera un momento y vuelve a intentarlo.';
        } else if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('failed to fetch')) {
            message = 'Ocurrió un error de red. Por favor, revisa tu conexión a internet y vuelve a intentarlo.';
        } else {
            message = `Ocurrió un error con el servicio de IA. Detalles: ${error.message}`;
        }
    }
    
    return new Error(message);
}

function buildUserContent(params: SummaryParams) {
  const { 
    transcript, 
    meetingTitle = 'N/A', 
    attendees = [],
    defaultOwner = 'N/A',
    outputLanguage = 'es-ES',
    timezone = 'America/Montevideo'
  } = params;

  return {
    meeting_title: meetingTitle,
    output_language: outputLanguage,
    timezone: timezone,
    default_owner: defaultOwner,
    transcript: transcript,
    metadata: {
      attendees: attendees,
      date: new Date().toISOString(),
      source: 'AI-Summarizer-Web-App',
      notion_targets: [],
    },
  };
}


export async function generateStructuredSummary(params: SummaryParams): Promise<SummaryData> {
  const userContent = buildUserContent(params);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: JSON.stringify(userContent),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_JSON,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_JSON_SCHEMA,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SummaryData;
  } catch (error) {
    throw handleApiError(error, 'generación de resumen');
  }
}

export async function generateMarkdownSummary(params: SummaryParams): Promise<string> {
    const userContent = buildUserContent(params);
    const prompt = `
      User Content:
      ${JSON.stringify(userContent, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_MARKDOWN,
            },
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'generación de resumen');
    }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // result contains "data:audio/webm;base64,..."
      if (!reader.result) {
        return reject(new Error("No se pudo leer el blob."));
      }
      const base64Data = (reader.result as string).split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const base64Audio = await blobToBase64(audioBlob);
    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type,
        data: base64Audio,
      },
    };
    const textPart = {
      text: "Transcribe esta grabación de audio con precisión. Conserva la puntuación.",
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [audioPart, textPart] },
    });

    return response.text;
  } catch (error) {
    throw handleApiError(error, 'transcripción');
  }
}