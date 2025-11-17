import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useWebchat } from '@botpress/webchat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const DEFAULT_WELCOME = "Salut! Moi c'est PolyÉDI. Je suis là pour t'accompagner sur l'ÉDI et le travail d'équipe. Pose-moi tes questions!";

export default function App() {
  const clientId = import.meta.env.VITE_BOTPRESS_CLIENT_ID ?? '';
  const [hasDockedInput, setHasDockedInput] = useState(() => {
    // Initialize based on whether messages exist (will be updated when messages load)
    return false;
  });
  const [inputReady, setInputReady] = useState(false);
  const [localAlerts, setLocalAlerts] = useState([]);

  const webchat = useWebchat({
    clientId,
    soundEnabled: false,
  });

  const { client, messages, user, isTyping, clientState, error, newConversation } = webchat;

  const botpressConfigured = Boolean(clientId);
  
  // Track if messages have been loaded from Botpress
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  
  useEffect(() => {
    // Once we have messages array (even if empty), consider it loaded
    if (messages !== undefined) {
      setMessagesLoaded(true);
    }
  }, [messages]);

  const botpressMessages = useMemo(() => {
    // Don't show initial welcome message - it's shown above the textbox instead
    if (!messages.length) {
      return [];
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

  // Check if there are existing messages on mount to avoid flash
  const hasExistingMessages = useMemo(() => botpressMessages.some((message) => message.sender === 'user'), [botpressMessages]);

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
        text: "Désolé, nous avons des problèmes techniques au moment. Réessayez sous peu.",
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
    // Always ensure input is ready after mount
    const timer = setTimeout(() => setInputReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Set hasDockedInput immediately when messages load to prevent flash
  useEffect(() => {
    if (hasUserMessage) {
      setHasDockedInput(true);
    } else if (messages.length === 0 && hasDockedInput) {
      // Only reset when conversation is explicitly cleared (messages.length is 0 and we're already docked)
      setHasDockedInput(false);
      setInputReady(true);
    }
  }, [hasUserMessage, messages.length]);

  // Initialize hasDockedInput on mount if messages already exist
  useEffect(() => {
    if (hasExistingMessages && !hasDockedInput) {
      setHasDockedInput(true);
    }
  }, [hasExistingMessages]);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-blue-500 to-green-500">
            PolyÉDI
          </div>
          {botpressConfigured && client && (
            <button
              onClick={() => {
                newConversation();
                setHasDockedInput(false);
                setLocalAlerts([]);
                setInputReady(true);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 border border-neutral-700 transition-colors"
              title="Nouvelle conversation"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <p className="text-base font-bold text-gray-300">Conseiller virtuel pour des équipes inclusives.</p>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden min-h-0 pt-[73px]">
        <div className={clsx('flex-1 overflow-y-auto px-4 sm:px-6 flex justify-center transition-all duration-700', hasDockedInput ? 'py-6 pb-32' : 'pb-6')}>
          <div className="w-full max-w-3xl">
            {!hasDockedInput && messagesLoaded && (
              <div className="flex items-center justify-center min-h-[calc(100vh-300px)] -mt-16">
                <div className="text-center space-y-4">
                  <p className="text-lg sm:text-xl text-gray-300 drop-shadow-lg">
                    {DEFAULT_WELCOME}
                  </p>
                </div>
              </div>
            )}
            <ChatWindow messages={combinedMessages} isTyping={!error && isTyping} />
          </div>
        </div>

        {hasDockedInput ? (
          <div
            className={clsx(
              'fixed bottom-0 left-0 right-0 w-full px-4 sm:px-6 py-4 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 flex flex-col items-center gap-4 z-40 transition-all duration-700 ease-out',
              inputReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <ChatInput
              onSend={handleSend}
              disabled={sendDisabled}
              className="shadow-lg"
              placeholder="Pose ta question sur l'ÉDI..."
            />
          </div>
        ) : (
          messagesLoaded && (
            <div
              className={clsx(
                'absolute left-0 right-0 top-[45%] -translate-y-1/2 w-full px-4 sm:px-6 py-4 flex flex-col items-center gap-4 z-30 transition-all duration-700 ease-out',
                inputReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              <ChatInput
                onSend={handleSend}
                disabled={sendDisabled}
                className="shadow-2xl"
                placeholder="Pose ta question sur l'ÉDI..."
              />
            </div>
          )
        )}
      </main>
    </div>
  );
}

