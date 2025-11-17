import { useState, useEffect } from 'react';

// --- CHAT PERSISTENCE ---
const CHAT_HISTORY_KEY = 'agoraChatHistory';
const CONVERSATION_ID_KEY = 'agoraConversationId';

// --- Helper function to parse the two known Botpress response formats ---
const parseBotpressResponse = (data) => {
  // Option (a): { message: { text: "..." } }
  if (data.message && data.message.text) {
    return data.message.text;
  }

  // Option (b): { responses: [{ text: "..." }] }
  if (data.responses && data.responses[0] && data.responses[0].text) {
    return data.responses[0].text;
  }

  // Fallback
  console.error('Unknown Botpress response format:', data);
  return "Erreur: Je n'ai pas pu lire la réponse. (Format inconnu)";
};

export function useChat() {
  // 1. STATE MANAGEMENT
  const [messages, setMessages] = useState(() => {
    try {
      const storedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
      return storedMessages
        ? JSON.parse(storedMessages)
        : [
            {
              id: 'init-welcome',
              sender: 'ai',
              text: 'Bonjour! Je suis PolyÉDI. Posez-moi une question sur l’ÉDI et les équipes de projet.',
            },
          ];
    } catch (e) {
      return [];
    }
  });

  const [isTyping, setIsTyping] = useState(false);

  // 2. CHAT HISTORY PERSISTENCE
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // 3. GET/SET CONVERSATION ID
  const getConversationId = () => {
    let convId = localStorage.getItem(CONVERSATION_ID_KEY);
    if (!convId) {
      convId = `agora-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(CONVERSATION_ID_KEY, convId);
    }
    return convId;
  };

  // 4. MAIN SEND FUNCTION (API CALL)
  const sendMessage = async (userInput) => {
    if (!userInput.trim()) return;

    const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const conversationId = getConversationId();

    try {
      const response = await fetch('/api/botpress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userInput,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Botpress API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Botpress Response:', data); // Log to check structure

      // Use the new robust parser
      const aiText = parseBotpressResponse(data);
      const aiMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to fetch from Botpress:', error);
      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "Désolé, une erreur est survenue lors de la connexion à l'API. (Vérifiez la console pour les détails)",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, sendMessage };
}

