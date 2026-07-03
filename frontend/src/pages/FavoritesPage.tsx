import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiHeart, FiMapPin } from 'react-icons/fi';
import api, { fetchFavorites, type Event } from '../lib/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites()
      .then(setFavorites)
      .catch(() => toast.error('Unable to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (eventId: number) => {
    await api.delete(`/api/events/${eventId}/favorite`);
    setFavorites((items) => items.filter((item) => item.id !== eventId));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Favorites</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Saved experiences</h1>
      </div>
      {loading && <p className="text-sm text-slate-600">Loading favorites...</p>}
      {!loading && favorites.length === 0 && <p className="text-sm text-slate-600">No saved events yet.</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {favorites.map((event) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><FiMapPin /> {event.location} - {new Date(event.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => removeFavorite(event.id)} className="rounded-full bg-rose-500/15 p-3 text-rose-500" aria-label="Remove favorite"><FiHeart /></button>
            </div>
            <Link to={`/events/${event.id}`} className="mt-5 inline-flex rounded-full border border-gray-200/40 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900">View Details</Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
