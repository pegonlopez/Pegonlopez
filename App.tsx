
import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import Recorder from './components/Recorder';
import Processor from './components/Processor';
import OutputDisplay from './components/OutputDisplay';
import { processTranscription } from './services/geminiService';
import { ProcessingOption } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ReadyToUpload);
  const [transcription, setTranscription] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionComplete = useCallback((finalTranscription: string) => {
    if (finalTranscription.trim()) {
      setTranscription(finalTranscription);
      setAppState(AppState.ReadyToProcess);
      setError(null);
    } else {
      setError('La transcripción falló o el audio estaba vacío. Por favor, inténtalo de nuevo.');
      setAppState(AppState.ReadyToUpload);
    }
  }, []);

  const handleProcessing = useCallback(async (
    option: ProcessingOption,
    customPrompt: string,
    includeFullTranscription: boolean
  ) => {
    setAppState(AppState.Processing);
    setError(null);
    try {
      const content = await processTranscription(
        transcription,
        option,
        customPrompt,
        includeFullTranscription
      );
      setGeneratedContent(content);
      setAppState(AppState.Complete);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido durante el procesamiento.');
      setAppState(AppState.ReadyToProcess);
    }
  }, [transcription]);

  const handleReset = () => {
    setAppState(AppState.ReadyToUpload);
    setTranscription('');
    setGeneratedContent('');
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.ReadyToUpload:
        return <Recorder onRecordingComplete={handleTranscriptionComplete} />;
      case AppState.ReadyToProcess:
        return <Processor transcription={transcription} onProcess={handleProcessing} />;
      case AppState.Processing:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-gray-300">La IA está analizando y generando tu documento...</p>
          </div>
        );
      case AppState.Complete:
        return <OutputDisplay content={generatedContent} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Audio Processor AI
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Sube, Transcribe y Transforma tu Audio en Documentos Estructurados.
          </p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 min-h-[60vh] flex flex-col">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;