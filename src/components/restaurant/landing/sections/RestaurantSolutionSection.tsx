import { motion } from 'framer-motion';
import { CheckCircle, Truck, Users, Package } from 'lucide-react';

export const RestaurantSolutionSection = () => {
  const solutions = [
    {
      icon: Package,
      title: 'Vous créez vos lots',
      description: 'En 2 minutes, ajoutez vos invendus sur la plateforme (avec IA pour vous aider)'
    },
    {
      icon: Truck,
      title: 'On s\'occupe de la logistique',
      description: 'Nos collecteurs récupèrent et livrent aux associations partenaires'
    },
    {
      icon: Users,
      title: 'Distribution aux bénéficiaires',
      description: 'Vos repas sont distribués en toute dignité aux personnes dans le besoin'
    },
    {
      icon: CheckCircle,
      title: 'Impact mesuré',
      description: 'Suivez en temps réel l\'impact de vos dons (repas sauvés, CO₂ évité)'
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            EcoPanier s'occupe de tout
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            De la création du lot à la distribution : une solution clé en main pour valoriser vos invendus
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full bg-orange-50 rounded-2xl p-6 border-2 border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 mb-4">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-light leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

