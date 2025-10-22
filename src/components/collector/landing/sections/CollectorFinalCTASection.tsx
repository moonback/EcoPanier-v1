import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CollectorFinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 bg-gradient-to-br from-success-900 via-success-800 to-success-900 overflow-hidden">
      {/* Pattern Background */}
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
          {/* Titre principal */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
            <span className="block">
              Prêt à rejoindre
            </span>
            <span className="animate-gradient bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent block">
              notre réseau ?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
            Rejoignez des centaines de collecteurs qui gagnent en livrant des repas solidaires dans leur quartier.
          </p>

          {/* Badges d'avantages */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow">
              <span className="text-lg">✨</span>
              <span>Inscription gratuite</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow">
              <span className="text-lg">⚡</span>
              <span>Première livraison en 24h</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20 shadow">
              <span className="text-lg">🚀</span>
              <span>Gains immédiats</span>
            </div>
          </div>

          {/* Boutons CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/auth?role=collector')}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-100 px-10 py-6 text-xl font-bold text-success-900 shadow-2xl transition-all"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Devenir collecteur</span>
              <ArrowRight className="relative z-10 w-6 h-6 transition-transform group-hover:translate-x-1" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/help')}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/15 px-10 py-6 text-xl font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/25"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Nous contacter</span>
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Mention légère en bas */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm text-white/60 mt-8 font-light"
          >
            Sans engagement • Assurance incluse • Support dédié
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 pt-16 border-t border-white/20"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-white/70 text-sm">Collecteurs actifs</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">7€</div>
                <div className="text-white/70 text-sm">Par livraison</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">24h</div>
                <div className="text-white/70 text-sm">Première mission</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
                <div className="text-white/70 text-sm">Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
