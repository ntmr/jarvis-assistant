export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not set on server' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Ты голосовой помощник. Отвечай понятно и кратко.' },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      return res.status(500).json({ error: data.error || 'DeepSeek API error' });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) {
      console.error('No answer in response:', data);
      return res.status(500).json({ error: 'Invalid response from DeepSeek' });
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
