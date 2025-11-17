import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useWebchat } from '@botpress/webchat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const DEFAULT_WELCOME = "Bonjour! Je suis PolyÉDI. Posez-moi une question sur l'ÉDI et les équipes de projet.";

export default function App() {
  const clientId = import.meta.env.VITE_BOTPRESS_CLIENT_ID ?? '';
  const [hasDockedInput, setHasDockedInput] = useState(false);
  const [inputReady, setInputReady] = useState(false);
  const [localAlerts, setLocalAlerts] = useState([]);

  const webchat = useWebchat({
    clientId,
    soundEnabled: false,
  });

  const { client, messages, user, isTyping, clientState, error, newConversation } = webchat;

  const botpressConfigured = Boolean(clientId);

  const botpressMessages = useMemo(() => {
    if (!messages.length) {
      return [
        {
          id: 'init-welcome',
          sender: 'ai',
          text: DEFAULT_WELCOME,
        },
      ];
    }

    const transformed = messages
      .map((message) => {
        let text = null;
        
        // Check nested structure: message.block.block.text (for bubble type)
        if (message.block?.block?.type === 'text' && typeof message.block.block.text === 'string') {
          text = message.block.block.text;
        }
        // Check direct structure: message.block.text (for direct text type)
        else if (message.block?.type === 'text' && typeof message.block.text === 'string') {
          text = message.block.text;
        }
        // Fallback: check for text in other possible locations
        else if (typeof message.text === 'string') {
          text = message.text;
        }

        if (!text) {
          return null;
        }

        const isUserMessage = message.authorId === user?.userId;
        return {
          id: message.id,
          sender: isUserMessage ? 'user' : 'ai',
          text: text,
        };
      })
      .filter(Boolean);

    return transformed;
  }, [messages, user?.userId]);

  const statusMessages = useMemo(() => {
    const notices = [];
    if (!botpressConfigured) {
      notices.push({
        id: 'missing-client-id',
        sender: 'ai',
        text: "ERREUR: le Client ID Botpress est manquant. Ajoutez `VITE_BOTPRESS_CLIENT_ID` dans votre .env.",
      });
    }
    if (error) {
      notices.push({
        id: `bp-error-${error.code ?? error.message ?? Date.now()}`,
        sender: 'ai',
        text: "Désolé, nous n'arrivons pas à joindre Botpress pour le moment. Réessayez sous peu.",
      });
    }
    return notices;
  }, [botpressConfigured, error]);

  const combinedMessages = useMemo(
    () => [...statusMessages, ...botpressMessages, ...localAlerts],
    [statusMessages, botpressMessages, localAlerts]
  );

  const hasUserMessage = useMemo(
    () => botpressMessages.some((message) => message.sender === 'user'),
    [botpressMessages]
  );

  useEffect(() => {
    const timer = setTimeout(() => setInputReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasDockedInput && hasUserMessage) {
      setHasDockedInput(true);
    }
  }, [hasDockedInput, hasUserMessage]);

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!botpressConfigured || !client) {
      setLocalAlerts((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: "ERREUR: Impossible d'envoyer le message. Vérifiez la configuration Botpress.",
        },
      ]);
      return;
    }

    try {
      await client.sendMessage({ type: 'text', text: trimmed });
    } catch (sendError) {
      console.error('Botpress sendMessage failed:', sendError);
      setLocalAlerts((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: "Désolé, l'envoi du message a échoué. Merci de réessayer.",
        },
      ]);
    }
  };

  // Allow typing even when not connected, but disable send button
  const inputDisabled = false; // Always allow typing
  const sendDisabled =
    !botpressConfigured || clientState !== 'connected' || !client || Boolean(error);

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200 flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-blue-500 to-green-500">
            PolyÉDI
          </div>
          {botpressConfigured && client && (
            <button
              onClick={newConversation}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 border border-neutral-700 transition-colors"
              title="Nouvelle conversation"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400">Conseiller virtuel pour des équipes inclusives.</p>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 pb-48 px-4 sm:px-6 flex justify-center">
          <div className="w-full max-w-3xl">
            <ChatWindow messages={combinedMessages} isTyping={!error && isTyping} />
          </div>
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
            disabled={sendDisabled}
            className={clsx(hasDockedInput ? 'shadow-lg' : 'shadow-2xl')}
            placeholder="Pose ta question sur l'ÉDI..."
          />
        </div>
      </main>
    </div>
  );
}

