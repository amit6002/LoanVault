import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Landmark, Menu, X, ArrowRight } from 'lucide-react';
import { PATHS } from '../utils/constants';
import Button from '../components/common/Button';

/**
 * ============================================================
 * PUBLIC LAYOUT COMPONENT (LIGHT THEME)
 * Structural layout for unauthenticated landing and calculator pages.
 * ============================================================
 */
export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: PATHS.HOME },
    { label: 'EMI Calculator', path: PATHS.EMI_CALCULATOR },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to={PATHS.HOME} className="flex items-center gap-2 group">
                <div className="p-2 bg-indigo-600 rounded-xl text-white group-hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/30">
                  <Landmark className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  LoanVault
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors hover:text-indigo-600 ${
                    isActive(link.path) ? 'text-indigo-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={PATHS.LOGIN}
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link to={PATHS.REGISTER}>
                <Button variant="primary" size="md" rightIcon={ArrowRight}>
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                leftIcon={isMenuOpen ? X : Menu}
                aria-label="Toggle navigation menu"
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white animate-in fade-in slide-in-from-top-4 duration-200 shadow-md">
            <div className="px-4 pt-3 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 pb-4 border-t border-slate-200 px-4 flex flex-col gap-3">
              <Link
                to={PATHS.LOGIN}
                onClick={() => setIsMenuOpen(false)}
                className="block text-center py-2 text-base font-semibold text-slate-700 hover:text-indigo-600"
              >
                Sign In
              </Link>
              <Link to={PATHS.REGISTER} onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* DYNAMIC CHILD PAGE CONTENT */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-900">
              LoanVault
            </span>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} LoanVault Financial Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
