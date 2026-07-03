import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { fetchMe } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.access_token);
      const authUser = await fetchMe();
      login(data.access_token, authUser);
      toast.success('Signed in successfully');
      navigate(authUser.role === 'organizer' ? '/dashboard' : '/events');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 rounded-[2rem] border border-gray-200/40 bg-white/95 p-8 shadow-soft lg:grid-cols-[0.9fr_1.1fr] card-pastel">
        <div className="rounded-[1.5rem] border border-gray-200/40 bg-white/95 p-8 card-pastel">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-600">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Access your event workspace</h1>
          <p className="mt-4 text-base leading-8 text-slate-600">Secure sign-in for attendees and organizers.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Email
            <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-2xl border border-gray-200/40 bg-white px-4 py-3 outline-none text-slate-900" placeholder="name@company.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Password
            <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="rounded-2xl border border-gray-200/40 bg-white px-4 py-3 outline-none text-slate-900" placeholder="Password" />
          </label>
          <button disabled={loading} className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-5 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="text-sm text-slate-600">
            New here? <Link to="/signup" className="text-brand-500">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
