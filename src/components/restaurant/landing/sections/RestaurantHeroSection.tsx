import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat } from 'lucide-react';

export const RestaurantHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-orange-900">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20"
          >
            <ChefHat className="w-5 h-5" />
            <span>Solution dédiée aux restaurateurs et traiteurs</span>
          </motion.div>

          {/* Titre */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
            <span className="block">
              Vos invendus ont
            </span>
            <span className="text-warning-400 block">
              une seconde vie
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl font-light">
            Restaurateurs, traiteurs : transformez vos restes de repas, buffets et événements en aide alimentaire. 
            <strong className="font-semibold text-white"> EcoPanier s'occupe de tout</strong>, de la mise en portions à la distribution aux bénéficiaires.
          </p>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 mb-12 max-w-2xl"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">0€</div>
              <div className="text-sm text-white/70">De coût</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-white/70">Valorisé</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">2 min</div>
              <div className="text-sm text-white/70">Pour créer un lot</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-orange-900 px-8 py-5 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
            >
              <span>Rejoindre EcoPanier</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => {
                const element = document.getElementById('use-cases');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white px-8 py-5 rounded-lg text-lg font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              Voir des exemples concrets
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

