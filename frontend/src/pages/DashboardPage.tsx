import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api, { fetchOrganizerEvents, type Analytics, type Event, type EventPayload, type Participant } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const blankEvent: EventPayload = {
  title: '',
  description: '',
  category: '',
  location: '',
  venue: '',
  date: new Date().toISOString().slice(0, 10),
  max_participants: 100
};

const colors = ['#5b7cff', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [form, setForm] = useState<EventPayload>(blankEvent);
  const [editingId, setEditingId] = useState<number | null>(null);

  const selectedEvent = useMemo(() => events.find((event) => event.id === selectedEventId) || null, [events, selectedEventId]);
  const trendData = useMemo(() => analytics?.month_labels.map((name, index) => ({ name, value: analytics.monthly_registration_trend[index] || 0 })) || [], [analytics]);

  const loadDashboard = async () => {
    try {
      const [eventRows, analyticsResponse] = await Promise.all([
        fetchOrganizerEvents(),
        api.get<Analytics>('/api/dashboard/analytics')
      ]);
      setEvents(eventRows);
      setAnalytics(analyticsResponse.data);
      if (!selectedEventId && eventRows.length) setSelectedEventId(eventRows[0].id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Unable to load organizer dashboard');
    }
  };

  useEffect(() => {
    if (user?.role === 'organizer') loadDashboard();
  }, [user]);

  useEffect(() => {
    if (!selectedEventId) {
      setParticipants([]);
      return;
    }
    api.get<Participant[]>(`/api/events/${selectedEventId}/participants`)
      .then(({ data }) => setParticipants(data))
      .catch(() => setParticipants([]));
  }, [selectedEventId]);

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/api/events/${editingId}`, form);
        toast.success('Event updated');
      } else {
        await api.post('/api/events/', form);
        toast.success('Event created');
      }
      setForm(blankEvent);
      setEditingId(null);
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Unable to save event');
    }
  };

  const editEvent = (event: Event) => {
    setEditingId(event.id);
    setSelectedEventId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      venue: event.venue,
      date: event.date,
      max_participants: event.max_participants
    });
  };

  const deleteEvent = async (eventId: number) => {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/api/events/${eventId}`);
    toast.success('Event deleted');
    setSelectedEventId(null);
    await loadDashboard();
  };

  const updateParticipant = async (participantId: number, status: string) => {
    if (!selectedEventId) return;
    const { data } = await api.patch<Participant>(`/api/events/${selectedEventId}/participants/${participantId}`, { status });
    setParticipants((rows) => rows.map((row) => row.id === participantId ? data : row));
  };

  const removeParticipant = async (participantId: number) => {
    if (!selectedEventId) return;
    await api.delete(`/api/events/${selectedEventId}/participants/${participantId}`);
    setParticipants((rows) => rows.filter((row) => row.id !== participantId));
  };

  if (user?.role !== 'organizer') {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-slate-600">Organizer access required.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Organizer dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Events, participants, and analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Events', value: analytics?.total_events ?? 0 },
          { label: 'Upcoming', value: analytics?.upcoming_events ?? 0 },
          { label: 'Completed', value: analytics?.completed_events ?? 0 },
          { label: 'Registrations', value: analytics?.total_registrations ?? 0 }
        ].map((card) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Monthly registration trend</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#5b7cff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Event mix</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics?.event_mix || []} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                  {(analytics?.event_mix || []).map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-600">Top event: {analytics?.popular_event || 'No registrations yet'}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submitEvent} className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit Event' : 'Create Event'}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-2xl border border-gray-200/40 px-4 py-3" />
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-2xl border border-gray-200/40 px-4 py-3" />
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City" className="rounded-2xl border border-gray-200/40 px-4 py-3" />
            <input required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue" className="rounded-2xl border border-gray-200/40 px-4 py-3" />
            <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-2xl border border-gray-200/40 px-4 py-3" />
            <input required type="number" min="1" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })} className="rounded-2xl border border-gray-200/40 px-4 py-3" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className="rounded-2xl border border-gray-200/40 px-4 py-3 md:col-span-2" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-5 py-3 font-semibold text-white">{editingId ? 'Save Event' : 'Create Event'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankEvent); }} className="rounded-full border border-gray-200/40 px-5 py-3 font-semibold text-slate-900">Cancel Edit</button>}
          </div>
        </form>

        <div className="rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Event Details</h2>
          <div className="mt-4 grid gap-3">
            {events.map((event) => (
              <div key={event.id} className={`rounded-2xl border p-4 ${selectedEventId === event.id ? 'border-brand-500 bg-pastel-sky/70' : 'border-gray-200/40 bg-white/95'}`}>
                <button onClick={() => setSelectedEventId(event.id)} className="w-full text-left">
                  <div className="font-semibold text-slate-900">{event.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{event.venue}, {event.location} - {new Date(event.date).toLocaleDateString()}</div>
                  <div className="mt-1 text-sm text-slate-600">{event.registration_count}/{event.max_participants} participants</div>
                </button>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => editEvent(event)} className="rounded-full border border-gray-200/40 px-3 py-1 text-sm">Edit</button>
                  <button onClick={() => deleteEvent(event.id)} className="rounded-full bg-rose-500/10 px-3 py-1 text-sm text-rose-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-brand-100/50 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Participant Management {selectedEvent ? `- ${selectedEvent.title}` : ''}</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-600">
              <tr>
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Ticket</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-t border-gray-200/50">
                  <td className="py-3 font-medium text-slate-900">{participant.user.name}</td>
                  <td>{participant.user.email}</td>
                  <td>
                    <select value={participant.status} onChange={(e) => updateParticipant(participant.id, e.target.value)} className="rounded-xl border border-gray-200/40 px-3 py-2">
                      <option value="confirmed">confirmed</option>
                      <option value="pending">pending</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(participant.created_at).toLocaleDateString()}</td>
                  <td>{participant.qr_code && <a href={participant.qr_code} download={`participant-${participant.id}.svg`} className="text-brand-500">Download</a>}</td>
                  <td><button onClick={() => removeParticipant(participant.id)} className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-700">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {participants.length === 0 && <p className="py-4 text-sm text-slate-600">No participants for the selected event.</p>}
        </div>
      </div>
    </div>
  );
}
