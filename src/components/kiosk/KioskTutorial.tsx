import { useState } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface KioskTutorialProps {
  onClose: () => void;
}

export const KioskTutorial = ({ onClose }: KioskTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    {
      title: t('kiosk.tutorial.steps.welcome.title'),
      description: t('kiosk.tutorial.steps.welcome.description'),
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: t('kiosk.tutorial.steps.scan.title'),
      description: t('kiosk.tutorial.steps.scan.description'),
      color: 'from-accent-500 to-accent-600'
    },
    {
      title: t('kiosk.tutorial.steps.choose.title'),
      description: t('kiosk.tutorial.steps.choose.description'),
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: t('kiosk.tutorial.steps.pin.title'),
      description: t('kiosk.tutorial.steps.pin.description'),
      color: 'from-warning-500 to-warning-600'
    },
    {
      title: t('kiosk.tutorial.steps.pickup.title'),
      description: t('kiosk.tutorial.steps.pickup.description'),
      color: 'from-success-500 to-success-600'
    },
    {
      title: t('kiosk.tutorial.steps.enjoy.title'),
      description: t('kiosk.tutorial.steps.enjoy.description'),
      color: 'from-blue-500 to-blue-600'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 animate-fade-in-up shadow-2xl">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={t('kiosk.tutorial.close')}
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Titre et description */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {step.title}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed px-4">
            {step.description}
          </p>
        </div>

        {/* Indicateurs de progression */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-primary-600'
                  : index < currentStep
                  ? 'w-2 bg-success-400'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Boutons de navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              <ChevronLeft size={20} />
              <span>{t('kiosk.tutorial.previous')}</span>
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold text-lg shadow-lg"
          >
            <span>{currentStep === steps.length - 1 ? t('kiosk.tutorial.start') : t('kiosk.tutorial.next')}</span>
            {currentStep < steps.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>

        {/* Bouton passer le tutoriel */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {t('kiosk.tutorial.skip')}
        </button>
      </div>
    </div>
  );
};

