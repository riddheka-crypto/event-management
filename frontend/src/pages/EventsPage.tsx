import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiFilter, FiHeart, FiMapPin, FiSearch } from 'react-icons/fi';
import api, { fetchEvents, type Event } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => toast.error('Unable to load events'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map((event) => event.category)))], [events]);
  const locations = useMemo(() => ['All', ...Array.from(new Set(events.map((event) => event.location)))], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || event.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || event.category === category;
      const matchesLocation = location === 'All' || event.location === location;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [events, search, category, location]);

  const toggleFavorite = async (event: Event) => {
    if (!isAuthenticated) {
      toast.error('Sign in to save favorites');
      return;
    }
    try {
      if (event.is_favorite) {
        await api.delete(`/api/events/${event.id}/favorite`);
      } else {
        await api.post(`/api/events/${event.id}/favorite`);
      }
      setEvents((items) => items.map((item) => item.id === event.id ? { ...item, is_favorite: !item.is_favorite } : item));
    } catch {
      toast.error('Unable to update favorite');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-200">Browse events</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Discover your next experience</h1>
        </div>
        <div className="flex w-full flex-col gap-3 rounded-[1.5rem] border border-brand-100/50 bg-white/90 p-4 shadow-soft md:flex-row lg:max-w-2xl">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-brand-100/50 bg-pastel-sky/70 px-4 py-3">
            <FiSearch className="text-brand-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-brand-100/50 bg-pastel-rose/70 px-4 py-3 text-sm outline-none text-slate-700">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-2xl border border-brand-100/50 bg-pastel-rose/70 px-4 py-3 text-sm outline-none text-slate-700">
            {locations.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-2 text-sm text-slate-600">
        <FiFilter /> {loading ? 'Loading events...' : `${filteredEvents.length} events matched your filters`}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredEvents.map((event) => (
          <motion.article key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-brand-200">{event.category}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{event.title}</h2>
              </div>
              <button onClick={() => toggleFavorite(event)} className={`rounded-full p-3 ${event.is_favorite ? 'bg-rose-500/15 text-rose-500' : 'bg-slate-100 text-slate-500'}`} aria-label="Toggle favorite">
                <FiHeart />
              </button>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{event.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-2"><FiMapPin /> {event.location}</span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <span>{event.registration_count}/{event.max_participants} registered</span>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-slate-600">{event.venue}</span>
              <Link to={`/events/${event.id}`} className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-4 py-2 text-sm font-semibold text-white">View Details</Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
