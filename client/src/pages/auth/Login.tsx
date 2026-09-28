import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, LogIn, Shield, Headphones, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const sessionExpired = searchParams.get('session_expired');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const loggedInUser = await login(email, password);
      showToast(`Welcome back, ${loggedInUser.name}!`, 'success');

      if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'agent') {
        navigate('/agent/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for presentation and portfolio evaluation
  const fillDemoAccount = (role: 'admin' | 'agent' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@crm.local');
      setPassword('Admin@123');
    } else if (role === 'agent') {
      setEmail('agent.sarah@crm.local');
      setPassword('Agent@123');
    } else {
      setEmail('john.doe@example.com');
      setPassword('Customer@123');
    }
    setError('');
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-200 mb-4">
          N
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to NexusCRM
        </h2>
        <p className="text-sm text-slate-500 mt-1.5">
          AI-Powered Customer Support & CRM Platform
        </p>
      </div>

      {sessionExpired && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800 text-center">
          Your session has expired. Please sign in again.
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Shield className="w-4 h-4 text-purple-600 mb-1" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('agent')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Headphones className="w-4 h-4 text-blue-600 mb-1" />
              <span>Agent</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('customer')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
