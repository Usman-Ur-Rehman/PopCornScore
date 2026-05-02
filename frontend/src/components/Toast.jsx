import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-900/90' : 'bg-red-900/90';
  const borderColor = isSuccess ? 'border-green-700' : 'border-red-700';
  const textColor = isSuccess ? 'text-green-300' : 'text-red-300';
  const icon = isSuccess ? '✓' : '✕';

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      className={`fixed top-6 right-6 ${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded-lg flex items-center gap-3 max-w-sm z-50 pointer-events-auto`}
    >
      <span className="text-lg font-bold">{icon}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}
