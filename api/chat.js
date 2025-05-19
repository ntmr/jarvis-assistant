const fetch = require('node-fetch');

let cachedToken = null;
let tokenExpireTime = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpireTime) {
    return cachedToken;
  }

  // Запрос к своему эндпоинту для получения токена
  const res = await fetch('http://localhost:3000/api/token'); // изменить URL если нужно
  const data = await res.json();

  if (!data.access_token) {
    throw new Error('Не удалось получить access_token');
  }

  cachedToken = data.access_token;
  tokenExpireTime = now + (30 * 60 * 1000) - (5 * 1000);

  return cachedToken;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
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

    const text = await response.text();

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
      return res.status(500).json({ error: 'Ошибка JSON: ' + jsonErr.message, raw: text });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Ошибка запроса к GigaChat: ' + err.message });
  }
}
