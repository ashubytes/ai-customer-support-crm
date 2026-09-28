import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, User, Phone, Building, UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await register(formData);
      showToast('Registration successful! Welcome to NexusCRM.', 'success');
      navigate('/customer/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-200 mb-4">
          N
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Customer Account
        </h2>
        <p className="text-sm text-slate-500 mt-1.5">
          Get support and track your requests in real-time
        </p>
      </div>

      <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company Name"
              name="company"
              type="text"
              placeholder="Acme Corp"
              value={formData.company}
              onChange={handleChange}
              leftIcon={<Building className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              name="phone"
              type="text"
              placeholder="+1-555-0199"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={isLoading}
            rightIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
