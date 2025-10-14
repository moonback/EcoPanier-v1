import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { userProfiles } from '../../../data/landingData';

export const UserProfilesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight max-w-3xl">
            Pour tous
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl font-light">
            Consommateurs, commerçants, bénéficiaires, associations et collecteurs unis contre le gaspillage
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {userProfiles.map((profile, index) => {
            const Icon = profile.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-10 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Icon className="w-10 h-10 text-black" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-2xl font-bold text-black">
                      {profile.title}
                    </h3>
                    <p className="text-gray-600 font-light">
                      {profile.subtitle}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 font-light leading-relaxed">
                  {profile.description}
                </p>
                
                <div className="space-y-3">
                  {profile.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700 font-light">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="group inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-lg text-lg font-medium hover:bg-gray-900 transition-all"
          >
            <span>Rejoindre la communauté</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

