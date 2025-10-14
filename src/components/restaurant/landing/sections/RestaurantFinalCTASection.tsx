import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const RestaurantFinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 bg-gradient-to-br from-orange-900 via-red-900 to-orange-900 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            <span className="block">
              Transformez vos invendus
            </span>
            <span className="text-warning-400 block">
              en impact solidaire
            </span>
          </h2>

          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
            Rejoignez gratuitement EcoPanier et donnez une seconde vie à vos repas
          </p>

          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span>✨</span>
              <span>100% gratuit</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span>⚡</span>
              <span>Configuration en 5 min</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
              <span>🚀</span>
              <span>Impact immédiat</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center justify-center gap-3 bg-white text-orange-900 px-10 py-5 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
            >
              <span>Rejoindre EcoPanier</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/help')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-5 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <span>Nous contacter</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-sm text-white/60 mt-8 font-light">
            Sans engagement • Accompagnement personnalisé • Support dédié
          </p>
        </motion.div>
      </div>
    </section>
  );
};

