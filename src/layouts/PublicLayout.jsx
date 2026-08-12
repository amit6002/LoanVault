import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Landmark, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { PATHS } from '../utils/constants';

/**
 * ============================================================
 * PUBLIC LAYOUT COMPONENT — PREMIUM EDITION
 * Glassmorphism sticky nav, animated mobile menu, and rich footer.
 * ============================================================
 */
export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: PATHS.HOME },
    { label: 'EMI Calculator', path: PATHS.EMI_CALCULATOR },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">

      {/* STICKY NAVIGATION HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-card border-b border-slate-200/60'
            : 'bg-white/80 backdrop-blur-md border-b border-slate-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={PATHS.HOME} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl text-white shadow-md shadow-indigo-600/25 group-hover:shadow-lg group-hover:shadow-indigo-600/30 transition-smooth-fast">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                  LoanVault
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-smooth-fast ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to={PATHS.LOGIN}
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-smooth-fast px-3 py-2 rounded-xl hover:bg-slate-100/70"
              >
                Sign In
              </Link>
              <Link
                to={PATHS.REGISTER}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/30 transition-smooth-fast"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-smooth-fast border border-transparent hover:border-slate-200"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl animate-slide-down shadow-card-md">
            <div className="px-4 pt-3 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-smooth-fast ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 pb-5 border-t border-slate-200/60 px-4 flex flex-col gap-3">
              <Link
                to={PATHS.LOGIN}
                className="block text-center py-3 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-smooth-fast"
              >
                Sign In
              </Link>
              <Link
                to={PATHS.REGISTER}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md shadow-indigo-600/20 transition-smooth-fast"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* DYNAMIC PAGE CONTENT */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* PREMIUM FOOTER */}
      <footer className="bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl text-white shadow-md shadow-indigo-600/20">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                  LoanVault
                </p>
                <p className="text-xs text-slate-500 font-medium">Enterprise Digital Lending</p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                <Sparkles className="h-3 w-3" />
                RBI Compliant
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
                <Sparkles className="h-3 w-3" />
                256-bit Encrypted
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-slate-500 hover:text-indigo-600 transition-smooth-fast font-medium">
                  Privacy Policy
                </a>
                <a href="#" className="text-xs text-slate-500 hover:text-indigo-600 transition-smooth-fast font-medium">
                  Terms of Service
                </a>
                <a href="#" className="text-xs text-slate-500 hover:text-indigo-600 transition-smooth-fast font-medium">
                  Contact
                </a>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} LoanVault Financial Technologies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
