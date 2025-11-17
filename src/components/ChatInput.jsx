import { useState } from 'react';
import clsx from 'clsx';

export default function ChatInput({
  onSend,
  disabled = false,
  className,
  placeholder = 'Pose ta question sur l’ÉDI...',
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'w-full max-w-3xl bg-neutral-800/80 backdrop-blur ring-1 ring-orange-500/60 rounded-2xl p-3 sm:p-4 shadow-2xl transition-all',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 focus:outline-none text-base sm:text-lg"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-sm sm:text-base transition hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </div>
    </form>
  );
}

