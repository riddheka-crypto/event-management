import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiMail, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const saveProfile = async () => {
    try {
      const payload: { name: string; email: string; password?: string } = { name, email };
      if (password) payload.password = password;
      const { data } = await api.patch('/api/auth/me', payload);
      setUser(data);
      setPassword('');
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Unable to update profile');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-gray-200/40 bg-white/95 p-8 shadow-soft card-pastel">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-pastel-rose text-2xl font-semibold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-slate-900">{user?.name || 'Your profile'}</h1>
          <div className="mt-8 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3"><FiMail /> {user?.email}</div>
            <div className="flex items-center gap-3"><FiShield /> {user?.role}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-gray-200/40 bg-white/95 p-8 shadow-soft card-pastel">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Profile settings</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Edit profile</h2>
            </div>
            <button onClick={saveProfile} className="rounded-full border border-gray-200/40 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900">Save changes</button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 text-slate-900" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 text-slate-900" />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
              New password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="rounded-2xl border border-gray-200/40 bg-white/95 px-4 py-3 text-slate-900" placeholder="Leave blank to keep current password" />
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-600 md:col-span-2"><FiUser /> Role changes are managed by account creation.</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
