import React, { useEffect, useRef, useState } from 'react';

// Extend the Window interface for TypeScript to recognize globally loaded libraries
declare global {
    interface Window {
        marked: any;
        jspdf: any;
        html2canvas: any;
        saveAs: (blob: Blob, filename: string) => void;
        htmlDocx: any;
    }
}
interface OutputDisplayProps {
  content: string;
  onReset: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, onReset }) => {
  const [renderedHtml, setRenderedHtml] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copiar Texto');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content && window.marked) {
      const html = window.marked.parse(content, { gfm: true, breaks: true });
      setRenderedHtml(html);
    }
  }, [content]);
  
  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = async () => {
    if (!contentRef.current || !content) return;
    try {
      const textBlob = new Blob([content], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({ 'text/plain': textBlob });
      await navigator.clipboard.write([clipboardItem]);
      setCopyButtonText('¡Copiado!');
      setTimeout(() => setCopyButtonText('Copiar Texto'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      navigator.clipboard.writeText(content);
      setCopyButtonText('¡Copiado!');
      setTimeout(() => setCopyButtonText('Copiar Texto'), 2000);
    }
  };
  
  const handleExportPdf = async () => {
    const contentElement = contentRef.current;
    if (!contentElement || !window.jspdf) {
        alert('La librería de generación de PDF no está disponible.');
        return;
    }
    setIsExporting('PDF');
    setIsExportMenuOpen(false);
    
    // Temporarily switch to light mode styles for PDF generation
    contentElement.classList.remove('prose-invert');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    await doc.html(contentElement, {
        callback: function (doc) {
            doc.save('documento.pdf');
            // Restore dark mode styles after generation is complete
            contentElement.classList.add('prose-invert');
            setIsExporting(null);
        },
        x: 15,
        y: 15,
        width: 180, // A4 width is 210mm, so 180mm with 15mm margins on each side
        windowWidth: contentElement.scrollWidth,
    });
  };

  const handleExportDocx = async () => {
    if (!renderedHtml || !window.htmlDocx || !window.saveAs) {
      alert('La librería de generación de DOCX no está disponible.');
      return;
    }
    setIsExporting('DOCX');
    setIsExportMenuOpen(false);

    const contentHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body>${renderedHtml}</body>
      </html>`;
    
    const fileBlob = window.htmlDocx.asBlob(contentHtml);
    window.saveAs(fileBlob, 'documento.docx');
    setIsExporting(null);
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
        <h2 className="text-2xl font-bold text-cyan-300">Documento Generado</h2>
        <div className="flex items-center gap-2 sm:gap-4">
            <button
                onClick={handleCopy}
                className="bg-gray-700 text-gray-200 hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-all duration-200 min-w-[120px]"
            >
                {copyButtonText}
            </button>

            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="bg-gray-700 text-gray-200 hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                Exportar
                <svg className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleExportPdf(); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        {isExporting === 'PDF' ? 'Generando...' : 'Como PDF'}
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleExportDocx(); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        {isExporting === 'DOCX' ? 'Generando...' : 'Como DOCX'}
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
                onClick={onReset}
                className="bg-cyan-600 text-white hover:bg-cyan-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
                Empezar de Nuevo
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