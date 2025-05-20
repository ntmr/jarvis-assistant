// components/AssistantIndicator.js
export default function AssistantIndicator({ isActive }) {
  return (
    <div className="indicator">
      {isActive ? 'Ассистент думает...' : 'Ожидает ваш голос'}
    </div>
  );
}
