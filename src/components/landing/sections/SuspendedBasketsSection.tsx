import { Heart, HandHeart, CheckCircle } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export const SuspendedBasketsSection = () => {
  return (
    <AnimatedSection className="py-20 bg-gradient-to-r from-secondary-50 to-accent-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-accent inline-flex items-center gap-2 mb-4">
            <Heart size={20} className="text-accent-600" fill="currentColor" />
            <span>Notre Mission Sociale</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Les Paniers Suspendus
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Inspiré du "caffè sospeso" italien, offrez un repas à une personne dans le besoin.
            <br />
            <span className="text-accent-600 font-bold">
              Chaque panier suspendu, c'est bien plus qu'un repas — c'est un sourire, un lien, un espoir partagé.
            </span>
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
              
              {/* Infographique */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur flex-1 min-w-[140px] text-center">
                  <div className="text-2xl font-bold mb-1">♻️ 1 repas</div>
                  <p className="text-xs text-primary-100">= 0.9kg de CO₂ évités</p>
                </div>
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur flex-1 min-w-[140px] text-center">
                  <div className="text-2xl font-bold mb-1">❤️ 1 panier</div>
                  <p className="text-xs text-primary-100">= 1 personne aidée</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-primary-300">
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
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-warning-400 rounded-full flex items-center justify-center shadow-soft-lg">
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
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="btn-primary w-full rounded-xl"
                  >
                    🎁 Offrir maintenant
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
    </AnimatedSection>
  );
};

