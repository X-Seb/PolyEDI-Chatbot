import React from 'react';
import clsx from 'clsx';

// Simple markdown renderer for bold and italic
function renderMarkdown(text) {
  // Split by lines to handle lists and line breaks
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Check if it's a list item (bullet or numbered)
    const isListItem = /^[\s]*[-•*]\s/.test(line) || /^[\s]*\d+\.\s/.test(line);
    
    // Process markdown in the line - bold first, then italic
    // First, replace bold: **text** or __text__ (double asterisks or double underscores)
    let processed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Then, replace italic: *text* or _text_ (single, but not if already bold)
    // Use a simpler approach that works across all browsers
    processed = processed
      .replace(/(^|[^*])\*([^*]+?)\*([^*]|$)/g, '$1<em>$2</em>$3')
      .replace(/(^|[^_])_([^_]+?)_([^_]|$)/g, '$1<em>$2</em>$3');
    
    // Wrap list items with spacing
    if (isListItem) {
      return (
        <div key={lineIndex} className="mb-2" dangerouslySetInnerHTML={{ __html: processed }} />
      );
    }
    
    // Regular line - add line break if not empty and not last
    if (lineIndex < lines.length - 1 && (line.trim() || processed.trim())) {
      return (
        <React.Fragment key={lineIndex}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          <br />
        </React.Fragment>
      );
    }
    
    return (
      <span key={lineIndex} dangerouslySetInnerHTML={{ __html: processed }} />
    );
  });
}

export default function ChatBubble({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={clsx(
        'flex w-full',
        isUser ? 'justify-end text-right' : 'justify-start text-left'
      )}
    >
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base shadow-lg transition-colors whitespace-pre-wrap',
          isUser
            ? 'bg-orange-600 text-white'
            : 'bg-neutral-800 text-gray-100 border border-green-500/40'
        )}
      >
        <div className="space-y-1">{renderMarkdown(message.text)}</div>
      </div>
    </div>
  );
}

