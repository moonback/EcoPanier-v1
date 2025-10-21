import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Leaf, TrendingUp } from 'lucide-react';

export const HeroSection = () => {
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

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 180,
        damping: 12,
        delay: 0.1
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Background image avec overlay moderne */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url(/slide-7.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary-950/70 to-black/80 backdrop-blur-sm"></div>
      </div>

      {/* Mesh gradient animé moderne */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orbs lumineux flottants */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl"
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

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge premium avec glassmorphism */}
          <motion.div variants={badgeVariants} className="mb-10">
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
                <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
              </motion.div>
              <span className="text-lg tracking-wide">Plateforme Anti-Gaspillage & Solidaire</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrendingUp className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Titre principal ultra moderne */}
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-7xl lg:text-9xl font-black text-white mb-8 leading-[1.1] tracking-tight"
          >
            <span className="block mb-3 text-white/95">
            Ensemble contre le
            </span>
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                gaspillage
              </span>
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-2xl -z-10"
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-gradient drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              alimentaire
            </span>
          </motion.h1>
          
          {/* Sous-titre moderne avec glassmorphism */}
          <motion.div 
            variants={itemVariants}
            className="max-w-4xl mx-auto mb-14"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
              <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
                Sauvez des invendus à{' '}
                <span className="relative inline-block">
                  <span className="text-accent-400 font-bold">prix réduits</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent-400 to-accent-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                  />
                </span>
                ,{' '}
                soutenez les{' '}
                <span className="relative inline-block">
                  <span className="text-primary-400 font-bold">commerçants locaux</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1.7 }}
                  />
                </span>
                {' '}et aidez les{' '}
                <span className="relative inline-block">
                  <span className="text-secondary-400 font-bold">personnes en précarité</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-400 to-secondary-600"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 1.9 }}
                  />
                </span>
              </p>
            </div>
          </motion.div>

          {/* Stats rapides */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {[
              { icon: Leaf, label: 'Écologique', value: '100%' },
              { icon: Users, label: 'Solidaire', value: '100%' },
              { icon: TrendingUp, label: 'Impact', value: 'Max' }
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -5 }}
              >
                <stat.icon className="w-6 h-6 text-primary-400" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Boutons CTA ultra modernes */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white px-12 py-6 rounded-2xl text-xl font-bold overflow-hidden shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.8)] transition-all duration-300"
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 drop-shadow-lg">Découvrir la plateforme</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/commercants')}
              className="group inline-flex items-center justify-center bg-white/15 backdrop-blur-xl text-white px-12 py-6 rounded-2xl text-xl font-bold hover:bg-white/25 transition-all duration-300 border-2 border-white/30 hover:border-white/50 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]"
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="drop-shadow-lg">Je suis commerçant</span>
            </motion.button>
          </motion.div>

          {/* Indicateur de scroll moderne */}
          <motion.div
            variants={itemVariants}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex flex-col items-center gap-3 text-white/60 cursor-pointer hover:text-white/90 transition-colors duration-300 group"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <span className="text-sm font-semibold uppercase tracking-widest">Découvrir plus</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2 group-hover:border-white/60 transition-colors">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 bg-white/60 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Particules flottantes améliorées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(59, 130, 246, 0.4)' :
                i % 3 === 1 ? 'rgba(239, 68, 68, 0.4)' :
                'rgba(168, 85, 247, 0.4)'
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

      {/* Grid subtil pour effet tech */}
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

