import React, { useEffect } from 'react';

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={() => onRemove(toast.id)} 
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    // Auto close after 3.8 seconds
    const timer = setTimeout(() => {
      onRemove();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const symbol = toast.type === 'success' ? '✓' : '✗';

  return (
    <div className={`toast ${toast.type}`}>
      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{symbol}</span>
      <div 
        style={{ flex: 1 }}
        dangerouslySetInnerHTML={{ __html: toast.message }}
      />
      <span className="toast-close" onClick={onRemove}>×</span>
    </div>
  );
}
