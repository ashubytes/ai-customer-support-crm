import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    const defaultRoute =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'agent'
        ? '/agent/dashboard'
        : '/customer/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
};
