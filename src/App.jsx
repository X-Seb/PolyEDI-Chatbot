import { useEffect, useState } from 'react';
import clsx from 'clsx';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useChat } from './hooks/useChat';

export default function App() {
  const { messages, isTyping, sendMessage } = useChat();
  const [hasDockedInput, setHasDockedInput] = useState(false);
  const [inputReady, setInputReady] = useState(false);

  const hasUserMessage = messages.some((message) => message.sender === 'user');

  useEffect(() => {
    const timer = setTimeout(() => setInputReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasDockedInput && hasUserMessage) {
      setHasDockedInput(true);
    }
  }, [hasDockedInput, hasUserMessage]);

  const handleSend = (text) => {
    sendMessage(text);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200 flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-blue-500 to-green-500">
          PolyÉDI
        </div>
        <p className="text-sm text-gray-400">Conseiller virtuel pour des équipes inclusives.</p>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 pb-48">
          <ChatWindow messages={messages} isTyping={isTyping} />
        </div>

        <div
          className={clsx(
            'absolute left-1/2 bottom-6 -translate-x-1/2 w-full px-4 sm:px-0 flex flex-col items-center gap-4 transition-all duration-700 ease-out',
            hasDockedInput ? 'translate-y-0' : '-translate-y-[40vh]',
            inputReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {!hasDockedInput && (
            <p className="text-center text-lg sm:text-xl text-gray-300 drop-shadow-lg">
              Salut! Moi, c&apos;est PolyÉDI. Comment puis-je t&apos;aider?
            </p>
          )}

          <ChatInput
            onSend={handleSend}
            disabled={isTyping}
            className={clsx(hasDockedInput ? 'shadow-lg' : 'shadow-2xl')}
            placeholder="Pose ta question sur l’ÉDI..."
          />
        </div>
      </main>
    </div>
  );
}

