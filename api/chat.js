export default async function handler(req, res) {
  const GIGACHAT_TOKEN = process.env.GIGACHAT_TOKEN;

  if (!GIGACHAT_TOKEN) {
    console.error("Ошибка: GIGACHAT_TOKEN не задан");
    return res.status(500).json({ error: 'GIGACHAT_TOKEN не задан' });
  }

  if (req.method !== 'POST') {
    console.error("Ошибка: Метод не разрешён");
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

    const text = await response.text();
    console.log("Ответ от GigaChat:", text);

    try {
      const data = JSON.parse(text);

      if (data.error) {
        console.error("Ошибка от GigaChat:", data.error);
        return res.status(400).json({ error: data.error.message || data.error });
      }

      if (!data.choices || data.choices.length === 0) {
        console.error("Ошибка: пустой ответ от GigaChat");
        return res.status(500).json({ error: 'Ответ GigaChat пуст' });
      }

      return res.status(200).json({
        choices: [
          {
            message: {
              content: data.choices[0].message || data.choices[0].text || "Пустой ответ от GigaChat"
            }
          }
        ]
      });
    } catch (jsonErr) {
      console.error("Ошибка парсинга JSON:", jsonErr.message);
      return res.status(500).json({ error: 'Ошибка парсинга JSON: ' + jsonErr.message, raw: text });
    }

  } catch (err) {
    console.error("Ошибка запроса к GigaChat:", err.message);
    return res.status(500).json({ error: 'Ошибка запроса к GigaChat: ' + err.message });
  }
}
