import React, { useEffect, useRef, useState } from 'react';

// Extend the Window interface to include 'marked' for TypeScript
declare global {
    interface Window {
        marked: any;
    }
}
interface OutputDisplayProps {
  content: string;
  onReset: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, onReset }) => {
  const [renderedHtml, setRenderedHtml] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content && window.marked) {
      const html = window.marked.parse(content, { gfm: true, breaks: true });
      setRenderedHtml(html);
    }
  }, [content]);

  const handleCopy = async () => {
    if (!contentRef.current || !renderedHtml) return;

    try {
      // Create blobs for both HTML and plain text for wider compatibility
      const htmlBlob = new Blob([renderedHtml], { type: 'text/html' });
      const textBlob = new Blob([contentRef.current.innerText], { type: 'text/plain' });
      
      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });

      await navigator.clipboard.write([clipboardItem]);

      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Text'), 2000);

    } catch (err) {
      console.error('Failed to copy rich text: ', err);
      // Fallback for older browsers
      navigator.clipboard.writeText(contentRef.current.innerText);
      setCopyButtonText('Copied as plain text!');
      setTimeout(() => setCopyButtonText('Copy Text'), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-cyan-300">Generated Document</h2>
        <div className="flex items-center gap-4">
            <button
                onClick={handleCopy}
                className="bg-gray-700 text-gray-200 hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-all duration-200 min-w-[120px]"
            >
                {copyButtonText}
            </button>
            <button
                onClick={onReset}
                className="bg-cyan-600 text-white hover:bg-cyan-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                Start Over
            </button>
        </div>
      </div>
      <div 
        className="flex-grow bg-gray-900/50 p-6 rounded-lg border border-gray-700 overflow-y-auto"
      >
        <div 
            ref={contentRef}
            className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-cyan-200 prose-strong:text-gray-100 prose-blockquote:border-cyan-500 prose-table:border-gray-600 prose-th:text-gray-100 prose-tr:border-gray-700 prose-td:border-gray-700"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
};

export default OutputDisplay;
