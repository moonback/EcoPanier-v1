import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  Leaf, 
  ArrowRight,
  HandHeart,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Sparkles,
  Globe,
  DollarSign
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visibleStats, setVisibleStats] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleStats(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const stats = [
    { value: '10k+', label: 'Repas sauvés', icon: Package, color: 'blue' },
    { value: '5k+', label: 'Personnes aidées', icon: Users, color: 'pink' },
    { value: '15T', label: 'CO₂ économisé', icon: Leaf, color: 'green' },
    { value: '50k€', label: 'Dons solidaires', icon: Heart, color: 'red' },
  ];

  const features = [
    {
      icon: ShoppingBag,
      title: 'Combattez le gaspillage',
      description: 'Achetez des invendus à prix réduits et donnez une seconde chance aux aliments.',
      color: 'blue',
    },
    {
      icon: HandHeart,
      title: 'Paniers Suspendus',
      description: 'Offrez des repas aux personnes en situation de précarité en toute dignité.',
      color: 'pink',
    },
    {
      icon: Leaf,
      title: 'Impact environnemental',
      description: 'Réduisez votre empreinte carbone tout en économisant sur vos courses.',
      color: 'green',
    },
    {
      icon: Users,
      title: 'Solidarité locale',
      description: 'Soutenez les commerçants de votre quartier et créez du lien social.',
      color: 'purple',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Découvrez les lots',
      description: 'Parcourez les invendus disponibles près de chez vous',
      icon: MapPin,
    },
    {
      step: 2,
      title: 'Réservez en ligne',
      description: 'Choisissez votre lot et payez en ligne de manière sécurisée',
      icon: ShoppingBag,
    },
    {
      step: 3,
      title: 'Récupérez vos courses',
      description: 'Présentez votre QR code au point de retrait',
      icon: Package,
    },
    {
      step: 4,
      title: 'Partagez la solidarité',
      description: 'Offrez un panier suspendu à quelqu\'un dans le besoin',
      icon: Heart,
    },
  ];

  const testimonials = [
    {
      name: 'Marie L.',
      role: 'Cliente',
      text: 'Grâce à cette plateforme, j\'économise 50€ par mois tout en aidant mon quartier. Une initiative magnifique !',
      avatar: '👩',
    },
    {
      name: 'Pierre D.',
      role: 'Commerçant',
      text: 'Fini le gaspillage ! Je valorise mes invendus et je participe à une action solidaire. Bravo !',
      avatar: '👨‍🍳',
    },
    {
      name: 'Association Entraide',
      role: 'Bénéficiaire',
      text: 'Les paniers suspendus permettent à nos bénéficiaires d\'accéder à des produits de qualité dans la dignité.',
      avatar: '🤝',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
                <Sparkles size={20} className="text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">
                  La solidarité alimentaire réinventée
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Sauvez des repas,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Nourrissez l'espoir
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Rejoignez le mouvement contre le gaspillage alimentaire et pour la solidarité.
              Achetez des invendus à prix réduits et offrez des repas à ceux qui en ont besoin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/dashboard')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Commencer maintenant
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Comment ça marche ?
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Icon size={32} className={`text-${stat.color}-600 mx-auto mb-2`} />
                    <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Mission sociale section */}
      <section className="py-20 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full mb-4">
              <Heart size={20} className="text-pink-600" />
              <span className="text-sm font-semibold text-pink-700">Notre Mission Sociale</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Les Paniers Suspendus
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Inspiré du "caffè sospeso" italien, offrez un repas à une personne dans le besoin.
              Un geste simple pour une solidarité digne et respectueuse.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <HandHeart size={32} className="text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comment ça fonctionne ?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      Lors de votre achat, cochez simplement "Offrir un panier suspendu"
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      Votre don est mis à disposition des associations partenaires
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      Les bénéficiaires récupèrent leur panier en toute dignité
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">
                      Transparence totale : suivez l'impact de vos dons
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Impact réel</h3>
                <p className="text-pink-100 mb-6">
                  Chaque panier suspendu permet à une personne en précarité d'accéder à des produits frais et de qualité, tout en réduisant le gaspillage alimentaire.
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black">5,000+</div>
                    <div className="text-sm text-pink-100">Personnes aidées</div>
                  </div>
                  <div className="w-px h-12 bg-pink-300" />
                  <div className="text-center">
                    <div className="text-3xl font-black">50k€</div>
                    <div className="text-sm text-pink-100">En dons</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-4xl">❤️</span>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Offrez la solidarité
                    </h3>
                    <p className="text-gray-600">
                      Votre générosité change des vies
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700 font-semibold">Panier Standard</span>
                      <span className="text-2xl font-black text-purple-600">5€</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-600" />
                        Produits frais du jour
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-600" />
                        Équivalent 2-3 repas
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-600" />
                        100% anti-gaspillage
                      </li>
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow">
                      Offrir un panier
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    💚 Réduction fiscale de 66% sur vos dons
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Pourquoi nous rejoindre ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète pour agir concrètement contre le gaspillage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className={`text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Clock size={20} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Simple et rapide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 transform -translate-y-1/2" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative">
                    <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {item.step}
                        </div>
                      </div>
                      
                      <div className="mt-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Ils témoignent
            </h2>
            <p className="text-xl text-gray-600">
              Des milliers d'utilisateurs nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats section */}
      <section id="stats-section" className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Notre impact en chiffres
            </h2>
            <p className="text-xl text-blue-100">
              Ensemble, nous changeons le monde
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Package, value: '10,247', label: 'Repas sauvés', suffix: '' },
              { icon: Users, value: '5,423', label: 'Personnes aidées', suffix: '' },
              { icon: Leaf, value: '15.2', label: 'Tonnes CO₂ évitées', suffix: 'T' },
              { icon: DollarSign, value: '52,800', label: 'Euros de dons', suffix: '€' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`text-center transform transition-all duration-1000 ${
                    visibleStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Icon size={48} className="mx-auto mb-4" />
                  <div className="text-5xl font-black mb-2">
                    {visibleStats ? stat.value : '0'}
                    {stat.suffix}
                  </div>
                  <div className="text-lg text-blue-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl text-white transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Prêt à faire la différence ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez notre communauté et participez à la révolution alimentaire solidaire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Users size={24} />
                Créer mon compte
              </button>
              <button
                onClick={() => navigate('/pickup')}
                className="px-8 py-4 bg-purple-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Globe size={24} />
                Découvrir la station de retrait
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                FoodShare
              </h3>
              <p className="text-gray-400">
                La plateforme de solidarité alimentaire qui change des vies
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Accueil</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">Comment ça marche</a></li>
                <li><a href="/pickup" className="hover:text-white transition">Station de retrait</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Assistance</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Suivez-nous</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  f
                </a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition">
                  📷
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition">
                  🐦
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 FoodShare - Tous droits réservés - Fait avec ❤️ pour un monde meilleur</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

