import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  HelpCircle, 
  Layers,
  Home,
  Store,
  Building2,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Comment ça marche', path: '/how-it-works', icon: Layers },
    { name: 'Centre d\'aide', path: '/help', icon: HelpCircle },
  ];

  const roleLinks = [
    { 
      name: 'Commerçants', 
      path: '/commercants', 
      icon: Store,
      description: 'Valorisez vos invendus',
      emoji: '🏪'
    },
    { 
      name: 'Associations', 
      path: '/associations', 
      icon: Building2,
      description: 'Gérez votre aide alimentaire',
      emoji: '🏛️'
    },
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
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  {link.name}
                </button>
              ))}
              
              {/* Dropdown "Pour vous" */}
              <div className="relative">
                <button
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Pour vous
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                  >
                    {roleLinks.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.path}
                          onClick={() => {
                            navigate(role.path);
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="text-2xl flex-shrink-0">{role.emoji}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
                              {role.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {role.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
            <nav className="space-y-1">
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
              
              {/* Section "Pour vous" en mobile */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">
                  Pour vous
                </div>
                {roleLinks.map((role) => (
                  <button
                    key={role.path}
                    onClick={() => {
                      navigate(role.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{role.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{role.name}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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

