
import React, { useState } from 'react';
import { transcribeAudioFile } from '../services/geminiService';

interface RecorderProps {
  onRecordingComplete: (transcription: string) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete }) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'audio/mpeg') {
      setError('Please upload a valid MP3 file.');
      if (event.target) event.target.value = '';
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Audio = dataUrl.split(',')[1];
          const transcription = await transcribeAudioFile(base64Audio, file.type);
          onRecordingComplete(transcription);
        } catch (err) {
          console.error('Transcription error:', err);
          setError(err instanceof Error ? err.message : 'Failed to transcribe the audio file.');
        } finally {
          setIsUploading(false);
          if (event.target) event.target.value = '';
        }
      };
      reader.onerror = () => {
        console.error('File reader error');
        setError('Failed to read the audio file.');
        setIsUploading(false);
        if (event.target) event.target.value = '';
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred during file processing.');
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {isUploading ? (
        <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-gray-300">Uploading and Transcribing Audio...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">Upload Your Audio</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                Select an MP3 audio file from your device to transcribe and process.
            </p>
            <label
              htmlFor="audio-upload"
              className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 text-lg
              ${isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500/50 cursor-pointer shadow-lg shadow-cyan-500/30'}`}
            >
                Select MP3 File
            </label>
            <input
                type="file"
                id="audio-upload"
                accept="audio/mpeg"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
            />
        </div>
      )}
    </div>
  );
};

export default Recorder;
