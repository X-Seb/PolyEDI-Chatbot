import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function ChatInput({
  onSend,
  disabled = false,
  className,
  placeholder = "Pose ta question sur l'ÉDI...",
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 128); // 128px = max-h-32 (8rem)
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (event) => {
    // Shift+Enter: new line
    // Enter: send message
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'w-full max-w-3xl bg-neutral-800/80 backdrop-blur ring-1 ring-orange-500/60 rounded-2xl p-3 sm:p-4 shadow-2xl transition-all',
        className
      )}
    >
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 focus:outline-none text-base sm:text-lg resize-none max-h-32 overflow-y-auto"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={false}
          rows={1}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-sm sm:text-base transition hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          Envoyer
        </button>
      </div>
    </form>
  );
}

