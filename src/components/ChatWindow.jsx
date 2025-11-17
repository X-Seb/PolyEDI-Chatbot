import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

export default function ChatWindow({ messages, isTyping }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="space-y-4" aria-live="polite">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-neutral-800 border border-green-500/40 rounded-2xl px-4 py-3 text-gray-100 text-sm shadow-lg">
            <span className="flex items-center gap-2">
              PolyÉDI écrit
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:0.3s]" />
              </span>
            </span>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

