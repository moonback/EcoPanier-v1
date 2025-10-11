import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Heart, 
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
            ? 'bg-white/80 backdrop-blur-lg shadow-lg' 
            : 'bg-white shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <Heart size={24} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  EcoPanier
                </div>
                <div className="text-xs text-gray-600 -mt-1">
                  Solidarité Alimentaire
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600 transition-all font-medium"
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* CTA Buttons Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-purple-600 font-semibold transition-colors"
              >
                <LogIn size={20} />
                Connexion
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <UserPlus size={20} />
                S'inscrire
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X size={28} className="text-gray-700" />
              ) : (
                <Menu size={28} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-purple-600 transition-all font-medium"
                  >
                    <Icon size={20} />
                    <span>{link.name}</span>
                  </button>
                );
              })}
              
              <div className="pt-4 border-t space-y-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-colors"
                >
                  <LogIn size={20} />
                  Connexion
                </button>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg"
                >
                  <UserPlus size={20} />
                  S'inscrire gratuitement
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

