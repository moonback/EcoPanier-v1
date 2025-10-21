import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Heart } from 'lucide-react';

export const AssociationHeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Background image avec overlay moderne */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url(/slide-2.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-950/70 to-black/80 backdrop-blur-sm"></div>
      </div>

      {/* Orbs lumineux flottants */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
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
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(168, 85, 247, 0.4)' :
                i % 3 === 1 ? 'rgba(236, 72, 153, 0.4)' :
                'rgba(147, 51, 234, 0.4)'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge premium */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold border border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] transition-all duration-300 group">
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
                <Building2 className="w-6 h-6 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </motion.div>
              <span className="text-lg tracking-wide">Rejoignez les associations engagées</span>
          </div>
          </motion.div>
          
          {/* Titre principal ultra moderne */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black text-white mb-8 leading-[1.1] tracking-tight"
          >
            <span className="block mb-3 text-white/95">
            Simplifiez la gestion de
            </span>
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 animate-gradient drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                votre aide alimentaire
              </span>
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-rose-600/20 blur-2xl -z-10"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              />
            </span>
          </motion.h1>
          
          {/* Sous-titre moderne avec glassmorphism */}
          <motion.div 
            variants={itemVariants}
            className="max-w-4xl mx-auto mb-14"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
              <p className="text-xl sm:text-2xl md:text-3xl text-white/95 font-light leading-relaxed">
                Une plateforme complète pour enregistrer, gérer et suivre vos bénéficiaires en{' '}
                <span className="relative inline-block">
                  <span className="text-purple-400 font-bold">toute dignité</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                  />
                </span>
                . Gratuit pour les associations.
              </p>
            </div>
          </motion.div>

          {/* Bouton CTA ultra-moderne */}
          <motion.div variants={itemVariants} className="mb-14">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-800 text-white px-12 py-6 rounded-2xl text-xl font-bold overflow-hidden shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.8)] transition-all duration-300"
              type="button"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-600"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <Heart className="w-6 h-6 relative z-10 fill-white" />
              <span className="relative z-10 drop-shadow-lg">Rejoindre la plateforme</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
          </motion.div>

          {/* Stats rapides modernisées */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: '100%', label: 'Gratuit', icon: '✨', gradient: 'from-yellow-500 to-orange-500' },
              { value: '5 min', label: 'Inscription bénéficiaire', icon: '⚡', gradient: 'from-purple-500 to-pink-500' },
              { value: '5000+', label: 'Bénéficiaires aidés', icon: '❤️', gradient: 'from-pink-500 to-rose-500' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 1.2 + i * 0.1
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:bg-white/15 transition-all duration-300"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className={`text-4xl sm:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                  {stat.value}
            </div>
                <div className="text-sm sm:text-base text-white/80 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Grid subtil */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
    </section>
  );
};

