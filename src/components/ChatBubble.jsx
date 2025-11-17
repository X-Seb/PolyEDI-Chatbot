import clsx from 'clsx';

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
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base shadow-lg transition-colors',
          isUser
            ? 'bg-orange-600 text-white'
            : 'bg-neutral-800 text-gray-100 border border-orange-500/30'
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

