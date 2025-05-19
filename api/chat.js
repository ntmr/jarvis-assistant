export default async function handler(req, res) {
  const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY;

  if (!AUTH_KEY) {
    return res.status(500).json({ error: 'GIGACHAT_AUTH_KEY не задан' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  try {
    // 1. Получаем Access Token
    const tokenRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': crypto.randomUUID(), // Можно использовать любой UUID
        'Authorization': AUTH_KEY
      },
      body: 'scope=GIGACHAT_API_PERS'
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(500).json({ error: 'Ошибка получения access_token', raw: tokenData });
    }

    const accessToken = tokenData.access_token;

    // 2. Запрашиваем ответ от GigaChat
    const chatRes = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: req.body.messages,
        temperature: 0.7,
      }),
    });

    const rawText = await chatRes.text();
    try {
      const data = JSON.parse(rawText);

      if (!data.choices || data.choices.length === 0) {
        return res.status(500).json({ error: 'Пустой ответ от GigaChat' });
      }

      return res.status(200).json({
        choices: [
          {
            message: {
              content: data.choices[0].message || data.choices[0].text || "Пустой ответ"
            }
          }
        ]
      });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка парсинга JSON', raw: rawText });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Ошибка: ' + err.message });
  }
}
