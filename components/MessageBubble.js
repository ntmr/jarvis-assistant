export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <p>{message.text}</p>
    </div>
  );
}
