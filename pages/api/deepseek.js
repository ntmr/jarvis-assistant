export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Ты дружелюбный голосовой ассистент, отвечай кратко и понятно.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Ответ не получен.';
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
