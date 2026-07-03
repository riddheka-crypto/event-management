import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { fetchMe } from '../lib/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'organizer'>('user');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password, role });
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.access_token);
      const authUser = await fetchMe();
      login(data.access_token, authUser);
      toast.success('Account created');
      navigate(authUser.role === 'organizer' ? '/dashboard' : '/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-gray-200/40 bg-white/95 p-8 shadow-soft card-pastel">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Start curating your event journey</h1>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Full name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 outline-none text-slate-900" placeholder="Alicia Stone" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Email
            <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 outline-none text-slate-900" placeholder="you@example.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Password
            <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 outline-none text-slate-900" placeholder="Password" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Account type
            <select value={role} onChange={(e) => setRole(e.target.value as 'user' | 'organizer')} className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 outline-none text-slate-900">
              <option value="user">Attendee</option>
              <option value="organizer">Organizer</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <button disabled={loading} className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-5 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
          <div className="md:col-span-2 text-sm text-slate-600">
            Already have an account? <Link to="/login" className="text-brand-500">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
