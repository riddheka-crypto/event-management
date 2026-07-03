import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'organizer';
};

export type Event = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  venue: string;
  date: string;
  max_participants: number;
  organizer_id: number;
  is_active: boolean;
  created_at: string;
  registration_count: number;
  is_favorite: boolean;
};

export type Registration = {
  id: number;
  status: string;
  qr_code?: string | null;
  created_at: string;
  event: Event;
};

export type Participant = {
  id: number;
  status: string;
  qr_code?: string | null;
  created_at: string;
  user: User;
};

export type Analytics = {
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  total_registrations: number;
  today_registrations: number;
  month_labels: string[];
  monthly_registration_trend: number[];
  event_mix: { name: string; value: number }[];
  popular_event: string | null;
};

export type EventPayload = Omit<Event, 'id' | 'organizer_id' | 'is_active' | 'created_at' | 'registration_count' | 'is_favorite'>;

export async function fetchMe() {
  const { data } = await api.get<User>('/api/auth/me');
  return data;
}

export async function fetchEvents() {
  const { data } = await api.get<Event[]>('/api/events/');
  return data;
}

export async function fetchEvent(id: string | number) {
  const { data } = await api.get<Event>(`/api/events/${id}`);
  return data;
}

export async function fetchOrganizerEvents() {
  const { data } = await api.get<Event[]>('/api/events/organizer');
  return data;
}

export async function fetchRegistrations() {
  const { data } = await api.get<Registration[]>('/api/events/my/registrations');
  return data;
}

export async function fetchFavorites() {
  const { data } = await api.get<Event[]>('/api/events/favorites');
  return data;
}
