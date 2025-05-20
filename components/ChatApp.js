// components/ChatApp.js
import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import AssistantAvatar from './AssistantAvatar';
import AssistantIndicator from './AssistantIndicator';
import ChatInput from './ChatInput';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const chatRef = useRef(null);

  const handleSendMessage = async (message) => {
    setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    setIsAssistantActive(true);

    const response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    setMessages((prev) => [...prev, { text: data.answer, sender: 'assistant' }]);
    setIsAssistantActive(false);
  };

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="chat-wrapper">
      <AssistantIndicator isActive={isAssistantActive} />
      <AssistantAvatar />
      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
