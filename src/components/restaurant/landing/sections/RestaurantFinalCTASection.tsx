import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChefHat, Zap } from 'lucide-react';

export const RestaurantFinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-orange-950 to-slate-900">
      {/* Orbs lumineux animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(249, 115, 22, 0.4)' :
                i % 3 === 1 ? 'rgba(239, 68, 68, 0.4)' :
                'rgba(234, 179, 8, 0.4)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              y: [0, -50 - Math.random() * 50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5 + Math.random(), 1]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge animé */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring",
              stiffness: 180,
              damping: 12,
              delay: 0.2
            }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold border border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <ChefHat className="w-6 h-6 text-orange-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
              </motion.div>
              <span className="text-lg tracking-wide">Rejoignez le mouvement</span>
            </div>
          </motion.div>

          {/* Titre principal ultra-impactant */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]"
          >
            <span className="block mb-3">
              Transformez vos invendus
            </span>
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-gradient drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                en impact
              </span>
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 blur-2xl -z-10"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 animate-gradient">
              solidaire
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-12 max-w-4xl mx-auto font-light leading-relaxed"
          >
            Rejoignez gratuitement EcoPanier et donnez une seconde vie à vos repas
          </motion.p>

          {/* Badges d'avantages ultra-modernes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-14 justify-center"
          >
            {[
              { icon: Sparkles, text: '100% gratuit' },
              { icon: Zap, text: 'Configuration en 5 min' },
              { icon: ChefHat, text: 'Impact immédiat' }
            ].map((badge, i) => (
              <motion.div
                key={badge.text}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.7 + i * 0.1
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white px-6 py-3.5 rounded-2xl text-base sm:text-lg font-bold border border-white/30 shadow-xl hover:bg-white/15 transition-all"
              >
                <badge.icon className="w-5 h-5" />
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Boutons CTA ultra-modernes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-12"
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-3 bg-white text-orange-900 px-12 py-6 rounded-2xl text-xl font-black overflow-hidden shadow-[0_20px_60px_-15px_rgba(249,115,22,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.8)] transition-all duration-300"
              type="button"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-100 to-yellow-100"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 drop-shadow-lg">Rejoindre EcoPanier</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/help')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-3 bg-white/15 backdrop-blur-xl text-white px-12 py-6 rounded-2xl text-xl font-bold hover:bg-white/25 transition-all duration-300 border-2 border-white/30 hover:border-white/50 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]"
              type="button"
            >
              <span className="drop-shadow-lg">Nous contacter</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
          </motion.div>

          {/* Mentions rassurantes */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm sm:text-base font-medium"
          >
            {[
              'Sans engagement',
              'Accompagnement personnalisé',
              'Support dédié',
              'IA incluse'
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 bg-white/40 rounded-full" />}
                <span>{item}</span>
              </div>
            ))}
          </motion.div>

          {/* Compteur social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-16"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-8 py-6 shadow-2xl">
              <div className="flex -space-x-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white shadow-lg flex items-center justify-center text-2xl"
                  >
                    {i % 2 === 0 ? '👨‍🍳' : '👩‍🍳'}
                  </motion.div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-black text-white">
                  +200 restaurateurs actifs
                </p>
                <p className="text-sm text-white/70 font-medium">
                  Ils font déjà la différence
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

