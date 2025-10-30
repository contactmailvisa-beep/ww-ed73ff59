import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

const CodeEditor = ({ value, onChange, language }: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [value]);

  useEffect(() => {
    if (preRef.current) {
      const highlighted = Prism.highlight(
        value,
        Prism.languages[language] || Prism.languages.plaintext,
        language
      );
      preRef.current.innerHTML = highlighted;
    }
  }, [value, language]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbersDiv = e.currentTarget.previousElementSibling?.previousElementSibling;
    const highlightDiv = e.currentTarget.previousElementSibling;
    if (lineNumbersDiv) {
      lineNumbersDiv.scrollTop = e.currentTarget.scrollTop;
    }
    if (highlightDiv) {
      highlightDiv.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="h-full flex bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm overflow-hidden rounded-lg">
      {/* Line Numbers */}
      <div 
        className="overflow-y-auto overflow-x-hidden bg-[#1e1e1e] text-[#858585] text-right pr-4 pl-3 py-3 select-none border-r border-[#333]"
        style={{ minWidth: '60px', maxHeight: '100%' }}
      >
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6" style={{ height: '24px' }}>
            {num}
          </div>
        ))}
      </div>
      
      {/* Syntax Highlighted Code (Background) */}
      <pre
        ref={preRef}
        className="absolute inset-0 bg-transparent p-3 pointer-events-none font-mono leading-6 overflow-auto whitespace-pre-wrap break-words"
        style={{ 
          lineHeight: '24px',
          left: '60px',
          color: 'transparent'
        }}
        aria-hidden="true"
      />
      
      {/* Code Area (Editable) */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent text-[#d4d4d4] p-3 outline-none resize-none font-mono leading-6 overflow-auto relative z-10"
          style={{ 
            caretColor: '#ffffff',
            lineHeight: '24px',
            tabSize: 2,
            color: 'transparent',
            WebkitTextFillColor: 'transparent'
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <pre
          ref={preRef}
          className="absolute top-0 left-0 w-full h-full bg-transparent p-3 pointer-events-none font-mono leading-6 overflow-auto whitespace-pre-wrap break-words"
          style={{ 
            lineHeight: '24px'
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
