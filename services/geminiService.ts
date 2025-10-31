import { GoogleGenAI } from '@google/genai';
import { ProcessingOption } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPromptForOption = (
  option: ProcessingOption,
  transcription: string,
  customPrompt: string
): string => {
  switch (option) {
    case ProcessingOption.Medical:
      return `
        # ROL Y OBJETIVO
        Actúa como un médico especialista altamente competente. Tu tarea es analizar la transcripción de una consulta de audio y generar un informe médico detallado, profesional y estructurado en español.
        Utiliza formato Markdown para los encabezados (ej. \`## Anamnesis\`) y texto en negrita (\`**texto**\`).

        # ANÁLISIS INICIAL
        1. Lee la transcripción completa para entender el contexto.
        2. Identifica la terminología médica para determinar la especialidad más probable (ej. Cardiología, Pediatría, Neurología, etc.).

        # TRANSCRIPCIÓN DEL AUDIO
        ---
        ${transcription}
        ---

        # GENERACIÓN DEL INFORME MÉDICO
        Crea el informe utilizando estrictamente la siguiente estructura. Si falta información en la transcripción para alguna sección, indica "Información no proporcionada en el audio".
        
        **Especialidad Identificada:** [Tu identificación de la especialidad]

        ## Informe Médico

        **Datos del Paciente:**
        - Nombre: [Extraer de la transcripción, si se menciona]
        - Edad: [Extraer de la transcripción, si se menciona]
        
        **Fecha de la Consulta:** [Si no se menciona, indica "No especificada"]

        **Motivo de la Consulta:** [Resume la razón principal de la visita del paciente]

        ## Anamnesis
        [Detalla los síntomas, historial médico relevante y antecedentes mencionados por el paciente]

        ## Exploración Física
        [Describe los hallazgos de la exploración física si se mencionan en la conversación]

        ## Impresión Diagnóstica
        [Basado en la información, formula un diagnóstico principal o diferencial]

        ## Plan de Actuación y Tratamiento
        [Detalla los pasos a seguir, como pruebas adicionales, medicación prescrita o recomendaciones]
      `;
    case ProcessingOption.Meeting:
      return `
        # ROL Y OBJETIVO
        Actúa como un secretario ejecutivo o asistente de dirección. Tu objetivo es generar un acta de reunión formal y objetiva en español, basada en la transcripción de audio proporcionada.
        Utiliza formato Markdown para los encabezados, negritas, listas y la tabla de acciones.

        # TRANSCRIPCIÓN DEL AUDIO
        ---
        ${transcription}
        ---

        # GENERACIÓN DEL ACTA DE REUNIÓN
        Utiliza la siguiente estructura para crear el acta. Extrae toda la información relevante de la transcripción.

        ## Acta de Reunión: [Asunto principal de la reunión]

        **Fecha:** [Extraer de la transcripción o indicar "No especificada"]
        **Hora:** [Extraer de la transcripción o indicar "No especificada"]
        **Lugar:** [Extraer de la transcripción o indicar "No especificada"]

        **Asistentes:**
        - [Lista de nombres mencionados]

        ### Resumen Ejecutivo
        [Un párrafo breve que resuma los puntos más importantes y las decisiones clave de la reunión]

        ### Temas Tratados
        1. [Tema 1]
        2. [Tema 2]
        3. ...

        ### Desarrollo de la Reunión
        [Resume los puntos clave discutidos para cada tema, las opiniones presentadas y los argumentos principales]

        ### Acuerdos y Decisiones
        - [Acuerdo 1]
        - [Acuerdo 2]
        - ...
        
        ### Acciones a Realizar
        Crea una tabla con las siguientes columnas: Acción, Responsable, Fecha Límite.
        | Acción | Responsable | Fecha Límite |
        |---|---|---|
        | [Tarea específica] | [Persona o equipo asignado] | [Fecha límite mencionada] |
      `;
    case ProcessingOption.Summary:
      return `
        # ROL Y OBJETIVO
        Tu tarea es analizar la siguiente transcripción de audio y generar un resumen conciso y claro en español. El formato debe ser una lista de puntos clave (bullet points).
        Utiliza formato Markdown para los encabezados (ej. \`### Puntos Clave\`) y las listas (ej. \`- Punto Clave\`).

        # TRANSCRIPCIÓN DEL AUDIO
        ---
        ${transcription}
        ---

        # GENERACIÓN DEL RESUMEN
        Crea un resumen que destaque los siguientes elementos en formato de lista:
        
        ### Puntos Clave
        - [Los temas más importantes discutidos]

        ### Preguntas Principales
        - [Las preguntas centrales que se hicieron durante la conversación]

        ### Conclusiones o Decisiones
        - [Los resultados o acuerdos a los que se llegaron]
      `;
    case ProcessingOption.Custom:
      return `
        # ROL Y OBJETIVO
        Actúa como un generador de documentos a medida. Tu única fuente de información es la transcripción de audio proporcionada. Debes seguir estrictamente las instrucciones del usuario para crear el documento solicitado.
        Cuando sea apropiado para la solicitud del usuario, utiliza formato Markdown para la estructura (encabezados, negritas, listas, etc.) para crear un documento bien formateado.

        # TRANSCRIPCIÓN COMPLETA DEL AUDIO
        ---
        ${transcription}
        ---

        # INSTRUCCIONES DEL USUARIO
        ---
        [INSTRUCCIONES_DEL_USUARIO]
        ${customPrompt}
        ---

        # TAREA
        Analiza en profundidad las [INSTRUCCIONES_DEL_USUARIO] para entender el formato, tono, estructura y objetivo del documento. Luego, utiliza la información de la transcripción para generar el documento que cumpla al 100% con la solicitud del usuario.
      `;
    default:
      return transcription;
  }
};

export const processTranscription = async (
  transcription: string,
  option: ProcessingOption,
  customPrompt: string,
  includeFullTranscription: boolean
): Promise<string> => {
  if (!transcription) return '';

  if (option === ProcessingOption.SoloTranscripcion) {
    return transcription;
  }

  const prompt = getPromptForOption(option, transcription, customPrompt);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let generatedText = response.text;

    if (includeFullTranscription) {
      generatedText += `
        \n\n---\n\n
        ## Transcripción Completa del Audio
        \n${transcription}
      `;
    }

    return generatedText;
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    throw new Error('No se pudo procesar la transcripción con la API de Gemini.');
  }
};

export const transcribeAudioFile = async (
  base64Audio: string,
  mimeType: string,
): Promise<string> => {
  if (!base64Audio || !mimeType) {
    throw new Error('Faltan los datos de audio o el tipo MIME.');
  }

  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: 'Transcribe this audio file completely and accurately. Provide only the transcribed text, without any introductory phrases or summaries.',
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [audioPart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error('Error transcribing audio file with Gemini:', error);
    throw new Error('No se pudo transcribir el archivo de audio con la API de Gemini.');
  }
};