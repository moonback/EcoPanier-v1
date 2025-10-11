import { X, Smartphone, Scan, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export const PickupHelp = ({ onClose }: { onClose: () => void }) => {
  const steps = [
    {
      icon: Smartphone,
      title: 'Le client présente son QR code',
      description: 'Le client ouvre son QR code depuis l\'application sur son téléphone',
      color: 'blue',
    },
    {
      icon: Scan,
      title: 'Scannez le code',
      description: 'Cliquez sur "Scanner le QR Code" et pointez la caméra vers l\'écran du client',
      color: 'purple',
    },
    {
      icon: Lock,
      title: 'Vérifiez le code PIN',
      description: 'Demandez au client son code PIN à 6 chiffres et saisissez-le',
      color: 'orange',
    },
    {
      icon: CheckCircle,
      title: 'Remettez le colis',
      description: 'Une fois validé, remettez le colis au client',
      color: 'green',
    },
  ];

  const troubleshooting = [
    {
      problem: 'Le QR code ne se scanne pas',
      solutions: [
        'Vérifiez que la caméra est autorisée dans le navigateur',
        'Assurez-vous d\'un bon éclairage',
        'Demandez au client d\'augmenter la luminosité de son écran',
        'Essayez de tenir le téléphone plus stable',
      ],
    },
    {
      problem: 'Code PIN incorrect',
      solutions: [
        'Demandez au client de vérifier son code PIN',
        'Assurez-vous de saisir les 6 chiffres correctement',
        'Le client peut retrouver son PIN dans l\'application',
      ],
    },
    {
      problem: 'Réservation déjà récupérée',
      solutions: [
        'Vérifiez avec le client s\'il n\'a pas déjà retiré sa commande',
        'Contactez le support si le problème persiste',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Guide d'utilisation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Étapes */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Étapes du retrait</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className={`bg-${step.color}-50 rounded-lg p-6 border-2 border-${step.color}-100`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`bg-${step.color}-100 rounded-full p-3 flex-shrink-0`}>
                        <Icon size={24} className={`text-${step.color}-600`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`bg-${step.color}-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold`}>
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-gray-800">{step.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dépannage */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-600" />
              Résolution de problèmes
            </h3>
            <div className="space-y-4">
              {troubleshooting.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-5">
                  <h4 className="font-bold text-gray-800 mb-3">{item.problem}</h4>
                  <ul className="space-y-2">
                    {item.solutions.map((solution, sIndex) => (
                      <li key={sIndex} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Conseils pratiques</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Gardez toujours l'interface ouverte pendant les heures de retrait</li>
              <li>• Utilisez une tablette ou un grand écran pour plus de confort</li>
              <li>• Assurez-vous d'un bon éclairage dans votre zone de scan</li>
              <li>• Testez régulièrement le scanner avec le mode démonstration</li>
              <li>• En cas de doute, n'hésitez pas à demander une pièce d'identité au client</li>
            </ul>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Contactez le support technique pour toute assistance supplémentaire
            </p>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

