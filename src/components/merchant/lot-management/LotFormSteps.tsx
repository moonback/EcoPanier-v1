import { Check, Sparkles, FileText, DollarSign, Clock, Settings } from 'lucide-react';
import type { StepInfo } from './types';

interface LotFormStepsProps {
  currentStep: number;
  isEditMode: boolean;
}

export const LotFormSteps = ({ currentStep, isEditMode }: LotFormStepsProps) => {
  const getSteps = (): StepInfo[] => {
    if (isEditMode) {
      return [
        { number: 1, title: 'Informations', icon: FileText },
        { number: 2, title: 'Prix & Quantité', icon: DollarSign },
        { number: 3, title: 'Horaires', icon: Clock },
        { number: 4, title: 'Options & Images', icon: Settings },
      ];
    } else {
      return [
        { number: 1, title: 'Analyse IA', icon: Sparkles },
        { number: 2, title: 'Informations', icon: FileText },
        { number: 3, title: 'Prix & Quantité', icon: DollarSign },
        { number: 4, title: 'Horaires', icon: Clock },
        { number: 5, title: 'Options & Images', icon: Settings },
      ];
    }
  };

  const steps = getSteps();

  return (
    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const StepIcon = step.icon;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Étape */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                    ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
                        : isActive
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-2 ring-blue-100'
                        : 'bg-white border border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check size={12} className="text-white" />
                  ) : (
                    <StepIcon size={10} className={isActive ? 'text-white' : 'text-gray-400'} />
                  )}
                </div>

                <span
                  className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : isCompleted
                      ? 'text-emerald-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Ligne de connexion */}
              {idx < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 rounded-full transition-all duration-500
                    ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : 'bg-gray-300'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

