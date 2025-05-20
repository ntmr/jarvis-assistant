export default function AssistantIndicator({ isActive }) {
  return (
    <div className={`assistant-indicator ${isActive ? 'active' : ''}`}>
      {isActive ? 'Ассистент думает...' : 'Готов к работе'}
    </div>
  );
}
