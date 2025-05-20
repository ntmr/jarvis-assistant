// components/MessageBubble.js
export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`bubble-container ${isUser ? 'user' : 'assistant'}`}>
      <div className="bubble">{message.text}</div>
    </div>
  );
}
