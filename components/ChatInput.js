// components/ChatInput.js
import { useState } from 'react';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <input
        type="text"
        className="chat-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Скажите что-нибудь..."
      />
      <button type="submit" className="send-button">Отправить</button>
    </form>
  );
}
