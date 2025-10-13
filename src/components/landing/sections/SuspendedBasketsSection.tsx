import { Heart, HandHeart, CheckCircle, Gift, ShoppingBag, Users } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export const SuspendedBasketsSection = () => {
  return (
    <AnimatedSection className="py-20 bg-gradient-to-r from-secondary-50 to-accent-50/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-accent inline-flex items-center gap-2 mb-4">
            <Heart size={20} className="text-accent-600" fill="currentColor" />
            <span>Une Plateforme Pour Tous</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Sauvez, Économisez, Partagez
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto font-medium">
            Les commerçants luttent contre le gaspillage, les clients économisent,
            <br />
            <span className="text-accent-600 font-bold">
              et les bénéficiaires accèdent gratuitement à des produits de qualité.
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Commerçants */}
          <div className="card p-8 hover-lift">
            <div className="w-16 h-16 bg-primary-100 rounded-large flex items-center justify-center mb-4">
              <HandHeart size={32} className="text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Pour les Commerçants
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Réduisez votre gaspillage alimentaire
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Créez des lots à prix réduits pour vos invendus
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  <strong className="text-accent-600">Mettez des lots gratuits</strong> exclusifs pour les bénéficiaires
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Valorisez votre engagement social et environnemental
                </span>
              </li>
            </ul>
            <div className="text-center text-sm text-primary-700 font-bold bg-primary-50 p-3 rounded-xl">
              💼 Agissez pour la planète et votre communauté
            </div>
          </div>

          {/* Clients */}
          <div className="card p-8 hover-lift border-2 border-secondary-200">
            <div className="w-16 h-16 bg-secondary-100 rounded-large flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-secondary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Pour les Clients
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  <strong className="text-secondary-600">Jusqu'à -70%</strong> sur des produits de qualité
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Économisez tout en sauvant des repas
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Récupérez vos lots facilement chez les commerçants
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Suivez votre impact environnemental en temps réel
                </span>
              </li>
            </ul>
            <div className="text-center text-sm text-secondary-700 font-bold bg-secondary-50 p-3 rounded-xl">
              🛍️ Économies + Impact = Win-Win
            </div>
          </div>

          {/* Bénéficiaires */}
          <div className="card p-8 hover-lift bg-gradient-to-br from-accent-50 to-warning-50 border-2 border-accent-200">
            <div className="w-16 h-16 bg-accent-100 rounded-large flex items-center justify-center mb-4">
              <Users size={32} className="text-accent-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Pour les Bénéficiaires
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Gift size={20} className="text-accent-600 flex-shrink-0 mt-1" fill="currentColor" />
                <span className="text-neutral-700 font-medium">
                  <strong className="text-accent-600">2 lots gratuits par jour</strong> maximum
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Accès exclusif aux lots gratuits des commerçants
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Produits frais et de qualité 100% gratuits
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-success-600 flex-shrink-0 mt-1" />
                <span className="text-neutral-700 font-medium">
                  Retrait en toute dignité et simplicité
                </span>
              </li>
            </ul>
            <div className="text-center text-sm text-accent-700 font-bold bg-white/80 p-3 rounded-xl">
              ❤️ Aide alimentaire gratuite et digne
            </div>
          </div>
        </div>

        {/* Section Impact */}
        <div className="mt-12 bg-gradient-primary rounded-large p-8 text-white shadow-soft-xl">
          <h3 className="text-3xl font-bold mb-4 text-center">Un Impact Triple</h3>
          <p className="text-primary-100 mb-6 font-medium text-center max-w-3xl mx-auto text-lg">
            Chaque lot sauvé réduit le gaspillage, aide une personne dans le besoin, et préserve notre planète.
          </p>
          
          {/* Statistiques d'impact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur text-center">
              <div className="text-3xl font-black mb-1">♻️ -70%</div>
              <p className="text-sm text-primary-100">De réduction max</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur text-center">
              <div className="text-3xl font-black mb-1">🎁 2/jour</div>
              <p className="text-sm text-primary-100">Lots gratuits bénéficiaires</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur text-center">
              <div className="text-3xl font-black mb-1">🌍 0.9kg</div>
              <p className="text-sm text-primary-100">CO₂ évités par repas</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur text-center">
              <div className="text-3xl font-black mb-1">💚 100%</div>
              <p className="text-sm text-primary-100">Anti-gaspillage</p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

