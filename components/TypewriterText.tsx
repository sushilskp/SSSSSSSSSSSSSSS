
import React, { useState, useEffect, useMemo } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (speed === 0) {
      setDisplayedText(text);
      setIndex(text.length);
      return;
    }

    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, index + 1));
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const processInlines = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-black bg-white/5 px-1 rounded">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-[#34D399] not-italic font-semibold">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-[#10B981] font-mono text-xs border border-white/5">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const renderedContent = useMemo(() => {
    const lines = displayedText.split('\n');
    const elements: React.ReactNode[] = [];
    
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
    let isInsideCodeBlock = false;
    let currentCodeContent = '';
    let currentLanguage = 'Logic';

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type;
        elements.push(
          <ListTag key={`list-${elements.length}`} className={`${ListTag === 'ol' ? 'list-decimal' : 'list-none'} pl-4 mb-6 space-y-3`}>
            {currentList.items}
          </ListTag>
        );
        currentList = null;
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      // Code Block Detection
      if (trimmed.startsWith('```')) {
        if (isInsideCodeBlock) {
          const codeToCopy = currentCodeContent;
          const blockId = `code-${i}`;
          elements.push(
            <div key={blockId} className="relative my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-2xl group/code">
              <div className="flex items-center justify-between bg-white/[0.03] px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{currentLanguage} Archive</span>
                </div>
                <button 
                  onClick={() => handleCopy(codeToCopy, blockId)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-all text-gray-500 hover:text-white"
                >
                  {copiedId === blockId ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto custom-scrollbar">
                <code className="text-[#34D399] font-mono text-[13px] leading-relaxed block whitespace-pre">
                  {currentCodeContent}
                </code>
              </pre>
            </div>
          );
          currentCodeContent = '';
          isInsideCodeBlock = false;
        } else {
          flushList();
          isInsideCodeBlock = true;
          currentLanguage = trimmed.slice(3).toUpperCase() || 'Logic';
        }
        return;
      }

      if (isInsideCodeBlock) {
        currentCodeContent += (currentCodeContent ? '\n' : '') + line;
        return;
      }

      // Header Detection (###, ##, #)
      const headerMatch = line.match(/^(#{1,4})\s+(.*)$/);
      if (headerMatch) {
        flushList();
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        if (level === 3) {
          elements.push(
            <h3 key={i} className="text-[#10B981] font-black text-sm uppercase tracking-[0.2em] mb-4 mt-8 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-[#10B981] rounded-full" />
              {processInlines(content)}
            </h3>
          );
        } else if (level === 1 || level === 2) {
          elements.push(
            <h2 key={i} className="text-white font-black text-lg uppercase tracking-tight mb-6 mt-10 border-b border-white/10 pb-2">
              {processInlines(content)}
            </h2>
          );
        } else {
          elements.push(
            <h4 key={i} className="text-gray-300 font-bold mt-6 mb-3 uppercase text-xs tracking-widest">
              {processInlines(content)}
            </h4>
          );
        }
        return;
      }

      // List Item Detection
      const ulMatch = line.match(/^[-*+]\s+(.*)$/);
      const olMatch = line.match(/^\d+\.\s+(.*)$/);

      if (ulMatch) {
        const itemContent = ulMatch[1];
        const itemElement = (
          <li key={i} className="relative pl-6 text-gray-300">
            <span className="absolute left-0 text-[#10B981] font-black">→</span>
            {processInlines(itemContent)}
          </li>
        );
        if (currentList && currentList.type === 'ul') {
          currentList.items.push(itemElement);
        } else {
          flushList();
          currentList = { type: 'ul', items: [itemElement] };
        }
        return;
      }

      if (olMatch) {
        const itemContent = olMatch[1];
        const itemElement = (
          <li key={i} className="text-gray-300 pl-2">
            {processInlines(itemContent)}
          </li>
        );
        if (currentList && currentList.type === 'ol') {
          currentList.items.push(itemElement);
        } else {
          flushList();
          currentList = { type: 'ol', items: [itemElement] };
        }
        return;
      }

      // Empty Line
      if (trimmed === '') {
        flushList();
        elements.push(<div key={`spacer-${i}`} className="h-6" />);
        return;
      }

      // Normal Text
      flushList();
      elements.push(
        <p key={i} className="mb-5 last:mb-0 text-gray-300 leading-relaxed font-medium">
          {processInlines(line)}
        </p>
      );
    });

    flushList();
    if (isInsideCodeBlock) {
      elements.push(
        <pre key="code-partial" className="bg-[#050505] p-6 rounded-2xl border border-white/10 overflow-x-auto my-8 opacity-60">
          <code className="text-[#34D399] font-mono text-[13px]">{currentCodeContent}</code>
        </pre>
      );
    }

    return elements;
  }, [displayedText, copiedId]);

  return (
    <div className="selection:bg-[#10B981]/30">
      {renderedContent}
      {index < text.length && (
        <span className="inline-block w-2 h-5 bg-[#10B981] ml-1 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};
