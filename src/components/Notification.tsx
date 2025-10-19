import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  visible,
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  const iconColor = isSuccess ? '#10B981' : '#EF4444';
  const bgColor = isSuccess ? '#F0FDF4' : '#FEF2F2';
  const borderColor = isSuccess ? '#10B981' : '#EF4444';

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '12px 16px',
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconColor }}
        >
          {isSuccess ? (
            <CheckCircleOutlined className="text-white text-sm" />
          ) : (
            <CloseCircleOutlined className="text-white text-sm" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <CloseCircleOutlined className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
