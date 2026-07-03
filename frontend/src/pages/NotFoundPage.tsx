import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="rounded-full border border-gray-200/40 bg-white/95 px-4 py-2 text-sm text-slate-600">404</div>
      <h1 className="mt-6 text-4xl font-semibold text-slate-900">The page you were looking for vanished.</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">The route you entered doesn’t exist or may have moved. Return home to continue exploring DOMinators.</p>
      <Link to="/" className="mt-8 rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-6 py-3 font-semibold text-white">Back home</Link>
    </div>
  );
}
