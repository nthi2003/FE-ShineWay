import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ExitHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động chuyển hướng về trang chủ khi component được mount
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển về trang chủ...</p>
      </div>
    </div>
  );
};

export default ExitHandler;
