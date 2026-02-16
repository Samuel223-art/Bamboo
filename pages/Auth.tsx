import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalState';
import { Button, Input, Card } from '../components/UIComponents';
import { Trees } from 'lucide-react';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const isLogin = mode === 'login';
  const { login, signup } = useGlobal();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        if (isLogin) await login(formData.email, formData.password);
        else await signup(formData.email, formData.password, formData.name);
        navigate('/dashboard');
    } catch (err: any) {
        setError(err.message || "Access denied.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-brand-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-brand-600 p-2 rounded-xl shadow-lg">
          <Trees className="text-white w-8 h-8" />
        </div>
        <span className="text-3xl font-extrabold text-brand-900 dark:text-white tracking-tight">Bamboo Bank</span>
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl border-brand-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-brand-900 dark:text-white mb-2">
            {isLogin ? 'Welcome back' : 'Join the Eco-System'}
          </h2>
          <p className="text-brand-600 dark:text-brand-400">
            {isLogin ? 'Enter your details to access your vault.' : 'Open your sustainable account today.'}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && <Input label="Full Identity Name" placeholder="e.g. Leo Green" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required={!isLogin} />}
          <Input label="Email Address" type="email" placeholder="name@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <div>
            <Input label="Access Key" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            {isLogin && <div className="flex justify-end mt-1"><a href="#" className="text-xs font-medium text-brand-600">Recovery needed?</a></div>}
          </div>
          <Button type="submit" className="w-full py-4 rounded-xl" isLoading={isLoading}>
            {isLogin ? 'Enter Vault' : 'Initialize Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "No account yet? " : "Already a member? "}
          <Link to={`/auth?mode=${isLogin ? 'signup' : 'login'}`} className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4">
            {isLogin ? 'Join Bamboo' : 'Log in here'}
          </Link>
        </div>
      </Card>
      <p className="mt-8 text-xs text-brand-500 font-medium">© 2024 Bamboo Global Banking Group. All Rights Reserved.</p>
    </div>
  );
};