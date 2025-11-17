import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

export default function ChatWindow({ messages, isTyping }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-6" aria-live="polite">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-neutral-800 border border-orange-500/30 rounded-2xl px-4 py-3 text-gray-100 text-sm shadow-lg">
            <span className="flex items-center gap-2">
              PolyÉDI écrit
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
              </span>
            </span>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

