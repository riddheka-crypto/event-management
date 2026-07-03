import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiCalendar, FiCompass, FiHeart, FiHome, FiInfo, FiLogIn, FiLogOut, FiMenu, FiPhone, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/events', label: 'Events', icon: FiCompass },
  { to: '/my-events', label: 'My Events', icon: FiBookmark },
  { to: '/favorites', label: 'Favorites', icon: FiHeart },
  { to: '/about', label: 'About', icon: FiInfo },
  { to: '/contact', label: 'Contact', icon: FiPhone },
  { to: '/dashboard', label: 'Dashboard', icon: FiCalendar }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <header className="sticky top-0 z-40 border-b border-brand-100/40 bg-white/80 backdrop-blur-xl shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-wide text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pastel-rose text-xl font-black">D</div>
            <div>
              <div>DOMinators</div>
              <div className="text-xs font-medium text-slate-600">Smart Events</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                  <NavLink key={link.to} to={link.to} className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition ${isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                  <Link to="/profile" className="flex items-center gap-2 rounded-full border border-gray-200/40 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900">
                  <FiUser /> Profile
                </Link>
                  <button onClick={logout} className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-900">
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-gradient-to-r from-brand-500 to-pastel-rose px-4 py-2 text-sm font-semibold text-white">
                Sign In
              </Link>
            )}
          </div>

          <button className="rounded-full border border-gray-200/40 bg-white/95 p-2 text-slate-900 md:hidden" onClick={() => setMenuOpen((v) => !v)}>
            <FiMenu />
          </button>
        </div>

        {menuOpen && (
            <div className="border-t border-gray-200/40 bg-white/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                    <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                    <Icon size={16} />
                    {link.label}
                  </NavLink>
                );
              })}
              {isAuthenticated ? (
                <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <FiUser /> Profile
                  </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 text-left text-sm font-medium text-slate-600">
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <FiLogIn /> Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <motion.main key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.main>

      <footer className="border-t border-brand-100/50 bg-white/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Copyright 2026 DOMinators. Smart event management for modern teams.</p>
          <div className="flex gap-4">
              <Link to="/events" className="hover:text-slate-900">Events</Link>
              <Link to="/about" className="hover:text-slate-900">About</Link>
              <Link to="/contact" className="hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
