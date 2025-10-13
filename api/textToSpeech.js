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
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      return res.status(500).json({ error: 'Google Cloud API key not configured' });
    }

    // Available Hebrew voices from Google Cloud
    const voices = {
      'female1': { name: 'he-IL-Wavenet-A', gender: 'FEMALE' },
      'female2': { name: 'he-IL-Wavenet-C', gender: 'FEMALE' },
      'male1': { name: 'he-IL-Wavenet-B', gender: 'MALE' },
      'male2': { name: 'he-IL-Wavenet-D', gender: 'MALE' }
    };

    // Default to female1 if not specified
    const selectedVoice = voices[voice] || voices['female1'];

    console.log('Generating TTS for:', text, 'with voice:', voice || 'female1');

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
            name: selectedVoice.name,
            ssmlGender: selectedVoice.gender
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

    if (!response.ok) {
      console.error('Google TTS error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Text-to-speech failed',
        details: data.error
      });
    }

    const audioBase64 = data.audioContent;

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
