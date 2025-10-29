
import React, { useState } from 'react';
import { ProcessingOption } from '../types';

interface ProcessorProps {
  transcription: string;
  onProcess: (
    option: ProcessingOption,
    customPrompt: string,
    includeFullTranscription: boolean
  ) => void;
}

const Processor: React.FC<ProcessorProps> = ({ transcription, onProcess }) => {
  const [selectedOption, setSelectedOption] = useState<ProcessingOption>(ProcessingOption.Summary);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [includeTranscription, setIncludeTranscription] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcess(selectedOption, customPrompt, includeTranscription);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-cyan-300">Transcription Ready</h2>
        <div className="max-h-40 overflow-y-auto bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300 whitespace-pre-wrap">{transcription}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">Choose Processing Mode:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.values(ProcessingOption) as Array<ProcessingOption>).map((option) => (
              <label
                key={option}
                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                  selectedOption === option ? 'bg-cyan-800/50 border-cyan-500' : 'bg-gray-700/50 border-gray-600 hover:border-cyan-700'
                }`}
              >
                <input
                  type="radio"
                  name="processingOption"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                  className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-500 focus:ring-cyan-600 focus:ring-2"
                />
                <span className="ml-3 text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedOption === ProcessingOption.Custom && (
          <div className="mb-6">
            <label htmlFor="custom-prompt" className="block text-lg font-semibold mb-2 text-gray-200">
              Custom Instructions:
            </label>
            <textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Create a friendly email summarizing the key points for the team.'"
              rows={4}
              required
              className="w-full p-3 bg-gray-900/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center mb-6">
            <input
              id="include-transcription"
              type="checkbox"
              checked={includeTranscription}
              onChange={(e) => setIncludeTranscription(e.target.checked)}
              className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-500 rounded focus:ring-cyan-600"
            />
            <label htmlFor="include-transcription" className="ml-3 text-gray-300">
              Add full transcription to the end of the document
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
          >
            Generate Document
          </button>
        </div>
      </form>
    </div>
  );
};

export default Processor;
