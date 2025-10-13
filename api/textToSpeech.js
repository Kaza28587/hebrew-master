export default async function handler(req, res) {
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

    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      return res.status(500).json({ error: 'Google Cloud API key not configured' });
    }

    console.log('Generating TTS for:', text);

    // Use Google Cloud Text-to-Speech
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text: text },
          voice: {
            languageCode: 'he-IL',
            name: 'he-IL-Wavenet-A',  // High quality WaveNet voice
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.9
          }
        })
      }
    );

    const data = await response.json();

    console.log('Google TTS response status:', response.status);

    if (!response.ok) {
      console.error('Google TTS error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Text-to-speech failed',
        details: data.error
      });
    }

    const audioBase64 = data.audioContent;

    console.log('TTS successful, audio generated');

    return res.status(200).json({ 
      audio: `data:audio/mpeg;base64,${audioBase64}`
    });

  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({ 
      error: 'Text-to-speech failed',
      details: error.message 
    });
  }
}
