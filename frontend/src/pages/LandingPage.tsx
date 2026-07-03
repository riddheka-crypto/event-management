import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiShield, FiZap, FiBookOpen, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { fetchEvents, type Event } from '../lib/api';

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents().then(setEvents).catch(() => setEvents([]));
  }, []);

  const featuredEvents = useMemo(() => events.slice(0, 3), [events]);
  const totalRegistrations = useMemo(() => events.reduce((sum, event) => sum + event.registration_count, 0), [events]);

  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] bg-white/90 px-4 py-20 shadow-soft sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-sm text-brand-500">
            <FiZap /> Smart event orchestration
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Create, discover, and manage remarkable events.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">DOMinators connects organizers and attendees with registration flows, QR tickets, analytics, and participant management in one place.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/events" className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-6 py-3 font-semibold text-white shadow-soft">Explore Events</Link>
            <Link to="/signup" className="rounded-full border border-gray-200/40 bg-white/95 px-6 py-3 font-semibold text-slate-900">Become an Organizer</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: totalRegistrations, label: 'Registrations' },
              { value: events.length, label: 'Active Events' },
              { value: new Set(events.map((event) => event.category)).size, label: 'Categories' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200/40 bg-white/95 p-4 shadow-soft card-pastel">
                <div className="text-2xl font-semibold text-slate-900">{item.value}</div>
                <div className="mt-1 text-sm text-slate-600">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="rounded-[2rem] border border-gray-200/40 bg-white/95 p-6 shadow-soft backdrop-blur-xl card-pastel">
            <div className="rounded-[1.5rem] border border-gray-200/40 bg-white/95 p-6 card-pastel">
              <p className="text-sm text-slate-600">Upcoming events</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Live from the API</h2>
              <div className="mt-6 grid gap-4">
                {featuredEvents.map((event) => (
                  <Link to={`/events/${event.id}`} key={event.id} className="rounded-2xl border border-gray-200/40 bg-white/95 p-4 card-pastel">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-600">{event.category}</p>
                        <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                      </div>
                      <div className="rounded-full bg-brand-500/10 px-3 py-1 text-sm text-brand-500">{new Date(event.date).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-2"><FiMapPin /> {event.location}</span>
                    </div>
                  </Link>
                ))}
                {featuredEvents.length === 0 && <p className="text-sm text-slate-600">No events have been published yet.</p>}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: FiBookOpen, title: 'Secure QR Tickets', text: 'Generate unique tickets when attendees register.' },
            { icon: FiUsers, title: 'Participant Management', text: 'Review registrations and update participant status.' },
            { icon: FiShield, title: 'Organizer Controls', text: 'Create, update, delete, and analyze events from the dashboard.' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-gray-200/40 bg-white/95 p-6 shadow-soft card-pastel">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-pastel-rose/20 text-brand-500">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-200">Featured events</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Recently published</h2>
          </div>
          <Link to="/events" className="hidden items-center gap-2 text-sm font-medium text-brand-200 md:flex">View all <FiArrowRight /></Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredEvents.map((event) => (
            <div key={event.id} className="rounded-[1.75rem] border border-gray-200/40 bg-white/95 p-6 shadow-soft card-pastel">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-600">{event.category}</span>
                <span className="text-sm text-slate-600">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600"><FiMapPin /> {event.venue}</div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-slate-600">{event.registration_count} registered</span>
                <Link to={`/events/${event.id}`} className="text-sm font-semibold text-brand-500">Reserve</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
