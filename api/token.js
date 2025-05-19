const fetch = require('node-fetch');

let cachedToken = null;
let tokenExpireTime = 0;

const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY; // Authorization key в формате Base64 (Basic ... без "Basic ")

export default async function handler(req, res) {
  try {
    const now = Date.now();

    if (cachedToken && now < tokenExpireTime) {
      // Токен еще валиден, возвращаем кэш
      return res.status(200).json({ access_token: cachedToken });
    }

    const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': 'some-unique-uuid',  // можно генерировать или просто строку
        'Authorization': `Basic ${AUTH_KEY}`,
      },
      body: 'scope=GIGACHAT_API_PERS',
    });

    const data = await response.json();

    if (!data.access_token) {
      return res.status(500).json({ error: 'Не удалось получить access_token', raw: data });
    }

    cachedToken = data.access_token;
    tokenExpireTime = now + (30 * 60 * 1000) - (5 * 1000); // 30 мин минус 5 сек запас

    return res.status(200).json({ access_token: cachedToken });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
