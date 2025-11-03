'use client';
import React from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContextNew';

interface NotificationWrapperProps {
  children: React.ReactNode;
}

const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id} userRole={user?.role}>
      {children}
    </NotificationProvider>
  );
};

export default NotificationWrapper;