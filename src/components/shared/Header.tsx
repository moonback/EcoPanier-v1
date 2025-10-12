import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  HelpCircle, 
  Layers,
  QrCode,
  LogIn,
  UserPlus,
  Home
} from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Comment ça marche', path: '/how-it-works', icon: Layers },
    { name: 'Station de retrait', path: '/pickup', icon: QrCode },
    { name: 'Centre d\'aide', path: '/help', icon: HelpCircle },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          transparent 
            ? 'glass shadow-soft-lg' 
            : 'bg-white shadow-soft-md border-b border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
            >
              <img
                src="/logo.png"
                alt="Logo EcoPanier"
                className="w-120 h-12 rounded-xl object-cover shadow-soft-lg transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-glow-md"
              />
              
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-all font-medium group"
                  >
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                    <span>{link.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* CTA Buttons Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 text-neutral-600 hover:text-primary-600 font-semibold transition-all hover-lift rounded-xl"
              >
                <LogIn size={20} />
                <span>Connexion</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary rounded-full"
              >
                <UserPlus size={20} />
                <span>S'inscrire</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 transition-all hover-lift"
            >
              {mobileMenuOpen ? (
                <X size={28} className="text-neutral-700" />
              ) : (
                <Menu size={28} className="text-neutral-700" />
              )}
            </button>
          </div>
        </div>

      </header>

      {/* Overlay pour fermer la sidebar */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header de la sidebar */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo EcoPanier"
                className="w-100 h-10 rounded-lg object-cover shadow-md"
              />
              
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <X size={24} className="text-neutral-700" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-3">
              Navigation
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-all font-medium group hover-lift"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-100 group-hover:bg-primary-100 rounded-lg transition-all">
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="flex-1 text-left">{link.name}</span>
                </button>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <button
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-all font-semibold shadow-sm"
            >
              <LogIn size={20} />
              <span>Connexion</span>
            </button>
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <UserPlus size={20} />
              <span>S'inscrire gratuitement</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

