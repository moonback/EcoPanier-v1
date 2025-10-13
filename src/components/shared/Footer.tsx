import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight
} from 'lucide-react';

export const Footer = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const footerSections = [
    {
      title: 'Navigation',
      links: [
        { name: 'Accueil', path: '/' },
        { name: 'Comment ça marche', path: '/how-it-works' },
        { name: 'Station de retrait', path: '/pickup' },
        { name: 'Centre d\'aide', path: '/help' },
      ],
    },
    {
      title: 'Pour les professionnels',
      links: [
        { name: 'Devenir commerçant', path: '/dashboard' },
        { name: 'Espace collecteur', path: '/dashboard' },
        { name: 'Partenariats', path: '/help' },
        { name: 'Tarifs', path: '/help' },
      ],
    },
    {
      title: 'Solidarité',
      links: [
        { name: 'Paniers suspendus', path: '/' },
        { name: 'Associations partenaires', path: '/help' },
        { name: 'Devenir bénéficiaire', path: '/help' },
        { name: 'Notre impact', path: '/' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'FAQ', path: '/help' },
        { name: 'Nous contacter', path: '/help' },
        { name: 'Mentions légales', path: '/help' },
        { name: 'Politique de confidentialité', path: '/help' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: Instagram, url: '#', color: 'hover:bg-pink-600' },
    { name: 'Twitter', icon: Twitter, url: '#', color: 'hover:bg-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:bg-blue-700' },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold mb-2">
                Restez informé
              </h3>
              <p className="text-white/70 font-light">
                Recevez nos dernières offres et actualités
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-5 py-3 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-white/30 outline-none font-light"
                />
                <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all font-medium whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <img
                  src="/logo.png"
                  alt="Logo EcoPanier"
                  className="h-10 rounded-lg object-cover"
                />
              </div>
              <p className="text-white/60 mb-6 leading-relaxed font-light max-w-sm">
                La plateforme qui connecte citoyens, commerçants et associations pour lutter contre le gaspillage alimentaire.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <a href={`mailto:${settings.platformEmail}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-all font-light">
                  <Mail size={16} strokeWidth={1.5} />
                  <span className="text-sm">{settings.platformEmail}</span>
                </a>
                <a href={`tel:${settings.supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-all font-light">
                  <Phone size={16} strokeWidth={1.5} />
                  <span className="text-sm">{settings.supportPhone}</span>
                </a>
                <div className="flex items-center gap-3 text-white/60 font-light">
                  <MapPin size={16} strokeWidth={1.5} />
                  <span className="text-sm">Paris, France</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-semibold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button
                        onClick={() => navigate(link.path)}
                        className="text-white/60 hover:text-white transition-all text-sm font-light"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links & Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                      title={social.name}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </a>
                  );
                })}
              </div>

              {/* Copyright */}
              <div className="text-center md:text-right">
                <p className="text-white/60 text-sm font-light">
                  © 2025 {settings.platformName}. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

