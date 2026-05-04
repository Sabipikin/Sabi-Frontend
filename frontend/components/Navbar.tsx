'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const whatsappLink = 'https://wa.me/2347037154753';

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/diplomas', label: 'Diplomas' },
    { href: '/programs', label: 'Programs' },
    { href: '/courses', label: 'Courses' },
    { href: '/my-courses', label: 'My Learning' },
    { href: '/certificates', label: 'Certificates' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link href="/dashboard" className="text-2xl sm:text-3xl font-bold text-foreground font-display glow-text hover:scale-105 transition-transform truncate">
              Sabipath
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm lg:text-base text-foreground hover:text-primary font-medium transition-colors relative group whitespace-nowrap">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
            <div className="relative">
              <button 
                onClick={() => setHelpOpen(!helpOpen)}
                className="text-sm lg:text-base text-foreground hover:text-primary font-medium transition-colors relative group whitespace-nowrap"
              >
                Help
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </button>
              {helpOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-primary/20 rounded-lg shadow-lg p-4 z-50">
                  <p className="text-sm text-foreground mb-3">📋 Coming Soon</p>
                  <p className="text-xs text-text-muted mb-4">Our support team is preparing an enhanced help center. In the meantime, reach out to us on WhatsApp!</p>
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-all"
                  >
                    💬
                    Message on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* User Menu & Mobile Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop User Info */}
            <div className="hidden sm:block text-right">
              <div className="font-semibold text-foreground text-xs sm:text-sm truncate">{user?.full_name}</div>
              <div className="text-text-muted text-xs truncate">{user?.email}</div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:block px-4 lg:px-6 py-2 lg:py-3 bg-secondary text-background rounded-lg lg:rounded-xl hover:bg-secondary/80 font-medium text-sm lg:text-base transition-all hover:scale-105 glow"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/20 py-3 space-y-2 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2 space-y-2">
              <button
                onClick={() => setHelpOpen(!helpOpen)}
                className="w-full text-left text-sm text-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-2 py-1 transition-all"
              >
                Help
              </button>
              {helpOpen && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 ml-2 mt-2">
                  <p className="text-xs text-foreground font-medium mb-2">📋 Coming Soon</p>
                  <p className="text-xs text-text-muted mb-3">Our support team is preparing an enhanced help center. In the meantime, reach out to us on WhatsApp!</p>
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setHelpOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-all"
                  >
                    💬
                    Message on WhatsApp
                  </a>
                </div>
              )}
            </div>
            <div className="border-t border-primary/20 pt-3 mt-3 space-y-2">
              <div className="px-3 py-2">
                <div className="font-semibold text-foreground text-xs truncate">{user?.full_name}</div>
                <div className="text-text-muted text-xs truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-2 bg-secondary text-background rounded-lg hover:bg-secondary/80 font-medium text-sm transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
