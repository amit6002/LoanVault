import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Landmark, Menu, X, ArrowRight } from 'lucide-react';
import { PATHS } from '../utils/constants';
import Button from '../components/common/Button';

/**
 * ============================================================
 * PUBLIC LAYOUT COMPONENT
 * The structural layout skeleton for all unauthenticated pages.
 * Includes global header, responsive navigation, and footer.
 * Refactored to utilize our design system Button component.
 * ============================================================
 */
export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Helper to determine if a route is currently active
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: PATHS.HOME },
    { label: 'EMI Calculator', path: PATHS.EMI_CALCULATOR },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to={PATHS.HOME} className="flex items-center gap-2 group">
                <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-500 transition-colors">
                  <Landmark className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  LoanVault
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                    isActive(link.path) ? 'text-blue-500 font-semibold' : 'text-slate-300'
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
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
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
          <div className="md:hidden border-b border-slate-800 bg-slate-900 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-slate-800 text-blue-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label
                }</Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-slate-800 px-5 flex flex-col gap-3">
              <Link
                to={PATHS.LOGIN}
                onClick={() => setIsMenuOpen(false)}
                className="block text-center py-2 text-base font-medium text-slate-300 hover:text-white transition-colors"
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
      <footer className="bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 rounded text-blue-500">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              LoanVault
            </span>
          </div>
          <p className="text-sm text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} LoanVault Financial Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
