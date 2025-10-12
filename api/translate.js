export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a Hebrew translator. Translate the given English text to Hebrew. Only respond with the Hebrew translation, nothing else.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Translation failed');
    }

    const translation = data.choices[0].message.content.trim();

    return res.status(200).json({ 
      translation,
      original: text
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: 'Translation failed',
      details: error.message 
    });
  }
}
