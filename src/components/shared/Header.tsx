import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header
        className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-200 ${
          isScrolled
            ? 'border-b border-neutral-200 bg-white/90 shadow-sm'
            : 'border-b border-transparent bg-white/70'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <img
              src="/logo.png"
              alt="Logo EcoPanier"
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* CTA Buttons Desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Connexion
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              S'inscrire
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
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
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] transform bg-white transition-transform duration-200 ease-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <img
              src="/logo.png"
              alt="Logo EcoPanier"
              className="h-8 rounded-lg object-cover"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
            >
              <X size={24} className="text-neutral-600" />
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
                  className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 border-t border-neutral-200 p-6">
            <button
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="w-full rounded-lg px-5 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              Connexion
            </button>
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="btn-primary w-full"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

