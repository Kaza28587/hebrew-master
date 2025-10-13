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

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    // ElevenLabs voice IDs for multilingual voices that support Hebrew
    const voices = {
      'female1': 'pNInz6obpgDQGcFmaJgB', // Adam - clear multilingual
      'female2': '21m00Tcm4TlvDq8ikWAM', // Rachel - warm female
      'male1': 'yoZ06aMxZJJ28mfd3POQ', // Sam - neutral male
      'male2': 'pqHfZKP75CvOlQylNhV4', // Bill - confident male
    };

    // Default to female1 if not specified
    const voiceId = voices[voice] || voices['female1'];

    console.log('Generating TTS with ElevenLabs for:', text, 'voice:', voice || 'female1');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('ElevenLabs error:', error);
      return res.status(response.status).json({ 
        error: error.detail?.message || 'Text-to-speech failed',
        details: error.detail
      });
    }

    // Get audio as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return res.status(200).json({ 
      audio: `data:audio/mpeg;base64,${base64Audio}`
    });

  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({ 
      error: 'Text-to-speech failed',
      details: error.message 
    });
  }
}
