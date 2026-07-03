import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-brand-100/50 bg-white/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-500">About DOMinators</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Built for modern organizers and attendees.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">DOMinators combines premium event discovery, seamless registration, QR-based access, and organizer analytics into one polished platform. It is designed to feel premium from first visit to final check-in.</p>
      </motion.div>
    </div>
  );
}
