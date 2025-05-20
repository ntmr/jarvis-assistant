import { useState } from 'react';
import MessageBubble from './MessageBubble';
import AssistantIndicator from './AssistantIndicator';
import AssistantAvatar from './AssistantAvatar';
import ChatInput from './ChatInput';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [isAssistantActive, setIsAssistantActive] = useState(false);

  const handleSendMessage = async (message) => {
    setMessages([...messages, { text: message, sender: 'user' }]);
    setIsAssistantActive(true);

    const response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: data.answer, sender: 'assistant' },
    ]);
    setIsAssistantActive(false);
  };

  return (
    <div className="chat-container">
      <AssistantIndicator isActive={isAssistantActive} />
      <AssistantAvatar />
      <div className="chat-box">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
