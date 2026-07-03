import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiBookOpen, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import api, { fetchEvent, type Event } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    fetchEvent(id)
      .then(setEvent)
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const register = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to register');
      return;
    }
    try {
      const { data } = await api.post(`/api/events/${id}/register`);
      setQrCode(data.qr_code);
      toast.success('Registration confirmed');
      if (event) setEvent({ ...event, registration_count: event.registration_count + 1 });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Unable to register');
    }
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-16 text-slate-600">Loading event...</div>;
  if (!event) return <div className="mx-auto max-w-7xl px-4 py-16"><Link to="/events" className="text-brand-500">Back to events</Link></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-brand-100/50 bg-white/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">{event.category}</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">{event.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">{event.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-100/50 bg-pastel-sky/70 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600"><FiCalendar /> Date</div>
              <div className="mt-2 font-semibold text-slate-900">{new Date(event.date).toLocaleDateString()}</div>
            </div>
            <div className="rounded-2xl border border-brand-100/50 bg-pastel-sky/70 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600"><FiMapPin /> Venue</div>
              <div className="mt-2 font-semibold text-slate-900">{event.venue}, {event.location}</div>
            </div>
            <div className="rounded-2xl border border-brand-100/50 bg-pastel-sky/70 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600"><FiUsers /> Capacity</div>
              <div className="mt-2 font-semibold text-slate-900">{event.registration_count}/{event.max_participants}</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[2rem] border border-gray-200/40 bg-white/95 p-8 shadow-soft card-pastel">
          <div className="flex items-center gap-2 text-slate-600"><FiBookOpen /> Secure registration</div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Reserve your seat</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Register instantly and receive a personalized QR ticket upon confirmation.</p>
          <button onClick={register} className="mt-6 w-full rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-5 py-3 font-semibold text-white">Register Now</button>
          {qrCode && (
            <div className="mt-8 rounded-2xl border border-gray-200/40 bg-white/95 p-4 text-center text-sm text-slate-600 card-pastel">
              <img src={qrCode} alt="QR ticket" className="mx-auto h-40 w-40" />
              <a href={qrCode} download={`ticket-${event.id}.svg`} className="mt-4 inline-flex rounded-full border border-gray-200/40 px-4 py-2 font-medium text-slate-900">Download Ticket</a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
