import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Ваш браузер не поддерживает Speech Recognition');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      sendToDeepseek(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setListening(false);
      setTimeout(() => startListening(), 1500);
    };

    recognition.onend = () => {
      setListening(false);
      if (!speechSynthesis.speaking) {
        startListening();
      }
    };

    recognitionRef.current = recognition;
    startListening();
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening && !speechSynthesis.speaking) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err.message);
      }
    }
  };

  const sendToDeepseek = async (text) => {
    try {
      const res = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.answer) {
        setResponse(data.answer);
        speakText(data.answer);
      }
    } catch (err) {
      console.error('Ошибка запроса:', err);
      startListening();
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.onend = () => {
      startListening();
    };
    speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 600, margin: 'auto' }}>
      <h1>Голосовой DeepSeek</h1>
      <p><strong>Вы сказали:</strong> {transcript || '...'}</p>
      <p><strong>Ответ:</strong> {response || '...'}</p>
      <p>{listening ? 'Слушаю...' : 'Остановлено'}</p>
      <button onClick={() => {
        if (listening) recognitionRef.current.stop();
        else startListening();
      }}>
        {listening ? 'Стоп' : 'Слушать'}
      </button>
    </div>
  );
}
