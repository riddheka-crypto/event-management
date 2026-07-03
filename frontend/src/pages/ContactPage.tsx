import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-brand-100/50 bg-white/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-500">Contact</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Need help with an event?</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">Reach the DOMinators team at hello@dominators.app for concierge support, enterprise planning, and integrations.</p>
      </motion.div>
    </div>
  );
}
