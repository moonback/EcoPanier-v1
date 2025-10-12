import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { 
  Heart, 
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
      <Header transparent />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center section-gradient overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full shadow-soft-lg hover-lift">
                <Sparkles size={20} className="text-warning-500 animate-pulse-soft" />
                <span className="text-sm font-bold text-neutral-700">
                  La solidarité alimentaire réinventée
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-6 leading-tight tracking-tight">
              Sauvez des repas,
              <br />
              <span className="text-gradient">
                Nourrissez l'espoir
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto font-medium">
              Rejoignez le mouvement contre le gaspillage alimentaire et pour la solidarité.
              Achetez des invendus à prix réduits et offrez des repas à ceux qui en ont besoin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary rounded-full px-8 py-4 text-lg group"
              >
                <span>Commencer maintenant</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/how-it-works')}
                className="btn-secondary rounded-full px-8 py-4 text-lg"
              >
                Comment ça marche ?
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  blue: 'text-primary-600',
                  pink: 'text-secondary-600',
                  green: 'text-success-600',
                  red: 'text-accent-600'
                };
                return (
                  <div
                    key={index}
                    className="card-gradient p-6 hover-lift cursor-default"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Icon size={32} className={`${colorMap[stat.color]} mx-auto mb-2`} />
                    <div className="text-3xl font-black text-neutral-900">{stat.value}</div>
                    <div className="text-sm text-neutral-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-neutral-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-neutral-400 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Mission sociale section */}
      <section className="py-20 bg-gradient-to-r from-secondary-50 to-accent-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="badge badge-accent inline-flex items-center gap-2 mb-4">
              <Heart size={20} className="text-accent-600" fill="currentColor" />
              <span>Notre Mission Sociale</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Les Paniers Suspendus
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
              Inspiré du "caffè sospeso" italien, offrez un repas à une personne dans le besoin.
              Un geste simple pour une solidarité digne et respectueuse.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="card p-8 hover-lift">
                <div className="w-16 h-16 bg-accent-100 rounded-large flex items-center justify-center mb-4">
                  <HandHeart size={32} className="text-accent-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Comment ça fonctionne ?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                    <span className="text-neutral-700 font-medium">
                      Lors de votre achat, cochez simplement "Offrir un panier suspendu"
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                    <span className="text-neutral-700 font-medium">
                      Votre don est mis à disposition des associations partenaires
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                    <span className="text-neutral-700 font-medium">
                      Les bénéficiaires récupèrent leur panier en toute dignité
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                    <span className="text-neutral-700 font-medium">
                      Transparence totale : suivez l'impact de vos dons
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-primary rounded-large p-8 text-white shadow-soft-xl">
                <h3 className="text-2xl font-bold mb-4">Impact réel</h3>
                <p className="text-primary-100 mb-6 font-medium">
                  Chaque panier suspendu permet à une personne en précarité d'accéder à des produits frais et de qualité, tout en réduisant le gaspillage alimentaire.
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black">5,000+</div>
                    <div className="text-sm text-primary-100">Personnes aidées</div>
                  </div>
                  <div className="w-px h-12 bg-primary-300" />
                  <div className="text-center">
                    <div className="text-3xl font-black">50k€</div>
                    <div className="text-sm text-primary-100">En dons</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 hover-lift">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-warning-400 rounded-full flex items-center justify-center shadow-soft-lg animate-pulse">
                  <span className="text-4xl">❤️</span>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      Offrez la solidarité
                    </h3>
                    <p className="text-neutral-600 font-medium">
                      Votre générosité change des vies
                    </p>
                  </div>

                  <div className="section-gradient rounded-large p-6 border border-primary-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-neutral-700 font-bold">Panier Standard</span>
                      <span className="text-3xl font-black text-gradient">5€</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm text-neutral-700 font-medium">
                        <CheckCircle size={16} className="text-success-600" />
                        Produits frais du jour
                      </li>
                      <li className="flex items-center gap-2 text-sm text-neutral-700 font-medium">
                        <CheckCircle size={16} className="text-success-600" />
                        Équivalent 2-3 repas
                      </li>
                      <li className="flex items-center gap-2 text-sm text-neutral-700 font-medium">
                        <CheckCircle size={16} className="text-success-600" />
                        100% anti-gaspillage
                      </li>
                    </ul>
                    <button className="btn-primary w-full rounded-xl">
                      Offrir un panier
                    </button>
                  </div>

                  <div className="text-center text-sm text-neutral-600 font-semibold bg-success-50 p-3 rounded-xl">
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
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Pourquoi nous rejoindre ?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
              Une plateforme complète pour agir concrètement contre le gaspillage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorMap: Record<string, { bg: string; text: string }> = {
                blue: { bg: 'bg-primary-100', text: 'text-primary-600' },
                pink: { bg: 'bg-secondary-100', text: 'text-secondary-600' },
                green: { bg: 'bg-success-100', text: 'text-success-600' },
                purple: { bg: 'bg-secondary-100', text: 'text-secondary-600' }
              };
              return (
                <div
                  key={index}
                  className="group card-gradient p-8 hover-lift"
                >
                  <div className={`w-16 h-16 ${colorMap[feature.color].bg} rounded-large flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={32} className={colorMap[feature.color].text} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 font-medium">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge badge-primary inline-flex items-center gap-2 mb-4">
              <Clock size={20} className="text-primary-600" />
              <span>Simple et rapide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Comment ça marche ?
            </h2>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary opacity-20 transform -translate-y-1/2" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative">
                    <div className="card p-8 hover-lift">
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-soft-lg animate-pulse-soft">
                          {item.step}
                        </div>
                      </div>
                      
                      <div className="mt-8 text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-large flex items-center justify-center mx-auto mb-4">
                          <Icon size={32} className="text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-neutral-600 font-medium">
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
      <section className="py-20 section-gradient">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Ils témoignent
            </h2>
            <p className="text-xl text-neutral-600 font-medium">
              Des milliers d'utilisateurs nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card p-8 hover-lift"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-soft-md">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-600 font-medium">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-neutral-700 italic font-medium">"{testimonial.text}"</p>
                <div className="mt-4 flex text-warning-400">
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
      <section id="stats-section" className="py-20 section-gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Notre impact en chiffres
            </h2>
            <p className="text-xl text-primary-100 font-medium">
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
                  className={`text-center transform transition-all duration-1000 glass-dark p-6 rounded-large hover-lift ${
                    visibleStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Icon size={48} className="mx-auto mb-4" />
                  <div className="text-5xl font-black mb-2">
                    {visibleStats ? stat.value : '0'}
                    {stat.suffix}
                  </div>
                  <div className="text-lg text-primary-100 font-semibold">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-primary rounded-3xl p-12 shadow-soft-xl text-white hover-lift border-2 border-primary-200">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Prêt à faire la différence ?
            </h2>
            <p className="text-xl text-primary-100 mb-8 font-medium">
              Rejoignez notre communauté et participez à la révolution alimentaire solidaire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-white text-primary-600 rounded-full font-bold text-lg shadow-soft-xl hover:shadow-glow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Users size={24} />
                <span>Créer mon compte</span>
              </button>
              <button
                onClick={() => navigate('/pickup')}
                className="px-8 py-4 bg-secondary-700 hover:bg-secondary-800 text-white rounded-full font-bold text-lg shadow-soft-xl hover:shadow-glow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Globe size={24} />
                <span>Découvrir la station de retrait</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

