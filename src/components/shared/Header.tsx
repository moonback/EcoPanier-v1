import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { NotificationCenter } from './NotificationCenter';

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Comment ça marche', path: '/how-it-works' },
    { name: 'Commerçants', path: '/commercants' },
    { name: 'Restaurateurs', path: '/restaurateurs' },
    { name: 'Associations', path: '/associations' },
    { name: 'Aide', path: '/help' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
            >
              <img
                src="/logo.png"
                alt="Logo EcoPanier"
                className="h-10 rounded-lg object-cover transition-opacity group-hover:opacity-80"
              />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors whitespace-nowrap"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* CTA Buttons & Notifications Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Notifications (si connecté) */}
              {user && (
                <NotificationCenter />
              )}
              
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-all text-sm font-medium"
              >
                S'inscrire
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="px-6 py-3 text-left text-sm font-medium bg-black text-white"
              >
                S'inscrire
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

