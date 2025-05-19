export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  try {
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/token`);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Нет access_token', details: tokenData });
    }

    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: req.body.messages,
        temperature: 0.7,
      }),
    });

    const text = await response.text();
    console.log('Ответ GigaChat:', text);

    try {
      const data = JSON.parse(text);
      if (data.error) {
        return res.status(400).json({ error: data.error.message || data.error });
      }
      if (!data.choices || data.choices.length === 0) {
        return res.status(500).json({ error: 'Ответ GigaChat пуст' });
      }
      return res.status(200).json(data);
    } catch (jsonErr) {
      console.error('Ошибка парсинга JSON от GigaChat:', jsonErr);
      return res.status(500).json({ error: 'Ошибка JSON от GigaChat: ' + jsonErr.message, raw: text });
    }
  } catch (err) {
    console.error('Ошибка запроса к GigaChat:', err);
    return res.status(500).json({ error: 'Ошибка запроса к GigaChat: ' + err.message });
  }
}
