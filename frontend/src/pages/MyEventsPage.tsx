import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCalendar } from 'react-icons/fi';
import { fetchRegistrations, type Registration } from '../lib/api';

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations()
      .then(setRegistrations)
      .catch(() => toast.error('Unable to load registrations'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-200">My events</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Your registrations and QR tickets</h1>
      </div>
      {loading && <p className="text-sm text-slate-600">Loading registrations...</p>}
      {!loading && registrations.length === 0 && <p className="text-sm text-slate-600">You have not registered for any events yet.</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        {registrations.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-600">REG-{item.id}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{item.event.title}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700'}`}>{item.status}</span>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-600"><FiCalendar /> {new Date(item.event.date).toLocaleDateString()}</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/events/${item.event.id}`} className="rounded-full border border-gray-200/40 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900">Event Details</Link>
              {item.qr_code && <a href={item.qr_code} download={`ticket-${item.id}.svg`} className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-4 py-2 text-sm font-semibold text-white">Download Ticket</a>}
            </div>
            {item.qr_code && <img src={item.qr_code} alt="QR ticket" className="mt-5 h-28 w-28 rounded-xl border border-gray-200/40 bg-white p-2" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
