let cachedToken = null;
let tokenExpiry = 0;

export default async function handler(req, res) {
  const AUTH_KEY = process.env.AUTHORIZATION_KEY; // Вставь сюда свой Authorization key в base64
  if (!AUTH_KEY) {
    return res.status(500).json({ error: 'AUTHORIZATION_KEY не задан' });
  }

  // Проверяем кеш токена (30 мин = 1800 сек)
  if (cachedToken && Date.now() < tokenExpiry) {
    return res.status(200).json({ access_token: cachedToken });
  }

  try {
    const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': '167b7266-cb7a-48fe-8884-a18836549bf6', // Можно генерить уникальный UUID на каждый запрос
        'Authorization': `Basic ${AUTH_KEY}`,
      },
      body: new URLSearchParams({
        scope: 'GIGACHAT_API_PERS',
      }),
    });

    const data = await response.json();
    if (!data.access_token) {
      console.error('Ошибка получения токена:', data);
      return res.status(500).json({ error: 'Не удалось получить access_token', details: data });
    }

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in || 1800) * 1000; // expires_in в секундах

    return res.status(200).json({ access_token: cachedToken });
  } catch (err) {
    console.error('Ошибка запроса токена:', err);
    return res.status(500).json({ error: 'Ошибка запроса токена', details: err.message });
  }
}
