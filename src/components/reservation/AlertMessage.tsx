// src/components/reservation/AlertMessage.tsx
interface AlertMessageProps {
  type: 'error' | 'success';
  message: string;
}

export function AlertMessage({ type, message }: AlertMessageProps) {
  const styles = type === 'error' 
    ? 'bg-red-50 border-red-200 text-[#CF8989]'
    : 'bg-green-50 border-green-200 text-green-700';

  return (
    <div className={`border ${styles} p-4 rounded-xl text-sm`}>
      {type === 'success' && <span className="mr-2">✅</span>}
      {message}
    </div>
  );
}