export default async function handler(req, res) {
  const GIGACHAT_TOKEN = process.env.GIGACHAT_TOKEN;

  if (!GIGACHAT_TOKEN) {
    return res.status(500).json({ error: 'GIGACHAT_TOKEN не задан в переменных окружения' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  try {
    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GIGACHAT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: req.body.messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ message: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: 'Пустой ответ от GigaChat' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Ошибка запроса: ' + error.message });
  }
}
