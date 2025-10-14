import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
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

            {/* CTA Buttons Desktop */}
            <div className="hidden lg:flex items-center gap-4">
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
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>

      </header>

      {/* Overlay pour fermer la sidebar */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <img
              src="/logo.png"
              alt="Logo EcoPanier"
              className="h-8 rounded-lg object-cover"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          </div>

          {/* CTA Buttons */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="w-full px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium"
            >
              Connexion
            </button>
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full px-5 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-medium"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

