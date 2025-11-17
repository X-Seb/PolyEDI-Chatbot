export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { text, conversationId } = req.body ?? {};

  if (!text || !conversationId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  const botId = process.env.VITE_BOTPRESS_BOT_ID;
  const apiKey = process.env.VITE_BOTPRESS_API_KEY;

  if (!botId || !apiKey) {
    return res
      .status(500)
      .json({ error: 'Configuration Botpress manquante sur le serveur.' });
  }

  const endpoint = `https://api.botpress.cloud/v1/bots/${botId}/conversations/${conversationId}/messages`;

  try {
    const bpResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        type: 'text',
        text,
      }),
    });

    if (!bpResponse.ok) {
      const errorPayload = await bpResponse.text();
      return res.status(bpResponse.status).json({
        error: 'Botpress API error',
        details: errorPayload,
      });
    }

    const data = await bpResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Botpress proxy failure:', error);
    return res.status(500).json({
      error: 'Échec de la connexion au proxy Botpress.',
    });
  }
}

