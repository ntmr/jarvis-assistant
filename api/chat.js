let cachedToken = null;
let tokenExpiresAt = 0;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const clientId = process.env.GIGACHAT_CLIENT_ID;
  const clientSecret = process.env.GIGACHAT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Не заданы GIGACHAT_CLIENT_ID или CLIENT_SECRET' });
  }

  try {
    const now = Date.now();

    // Если токен не получен или истек
    if (!cachedToken || now >= tokenExpiresAt) {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': crypto.randomUUID(),
          'Authorization': `Basic ${basicAuth}`
        },
        body: 'scope=GIGACHAT_API_PERS'
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        return res.status(500).json({ error: 'Не удалось получить access_token', raw: tokenData });
      }

      cachedToken = tokenData.access_token;
      tokenExpiresAt = now + 25 * 60 * 1000; // Кешируем на 25 минут
    }

    // Запрос к GigaChat
    const chatRes = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cachedToken}`,
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

      // Приводим к формату OpenAI
      return res.status(200).json({
        choices: [
          {
            message: {
              content: data.choices[0].message?.content || data.choices[0].text || 'Пусто'
            }
          }
        ]
      });
    } catch (e) {
      return res.status(500).json({ error: 'Ошибка JSON', raw: rawText });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
  }
}
