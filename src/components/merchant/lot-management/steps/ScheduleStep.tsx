import { Calendar, Clock, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { LotFormState } from '../types';

interface ScheduleStepProps {
  formState: LotFormState;
}

export const ScheduleStep = ({ formState }: ScheduleStepProps) => {
  const {
    formData,
    selectedDateOption,
    setSelectedDateOption,
    customDate,
    setCustomDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  } = formState;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-2">Horaires de retrait</h4>
        <p className="text-gray-600">Quand vos clients pourront-ils récupérer le produit ?</p>
      </div>

      {/* Sélection du jour */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <Calendar className="inline-block mr-2" size={16} />
          <span className="text-red-500">*</span> Choisissez le jour
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedDateOption('today')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedDateOption === 'today'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="font-semibold text-gray-900">Aujourd'hui</div>
            <div className="text-sm text-gray-600 mt-1">
              {format(new Date(), 'EEEE d MMMM', { locale: fr })}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDateOption('tomorrow')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedDateOption === 'tomorrow'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="font-semibold text-gray-900">Demain</div>
            <div className="text-sm text-gray-600 mt-1">
              {format(addDays(new Date(), 1), 'EEEE d MMMM', { locale: fr })}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDateOption('custom')}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedDateOption === 'custom'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="font-semibold text-gray-900">Autre jour</div>
            <div className="text-sm text-gray-600 mt-1">Date personnalisée</div>
          </button>
        </div>

        {selectedDateOption === 'custom' && (
          <div className="mt-3">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
        )}
      </div>

      {/* Créneaux horaires */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          <Clock className="inline-block mr-2" size={16} />
          <span className="text-red-500">*</span> Créneaux horaires
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              setStartTime('12:00');
              setEndTime('14:00');
            }}
            className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
          >
            <div className="font-medium text-gray-900">🌞 Midi</div>
            <div className="text-sm text-gray-600">12:00 - 14:00</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setStartTime('18:00');
              setEndTime('20:00');
            }}
            className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
          >
            <div className="font-medium text-gray-900">🌙 Soir</div>
            <div className="text-sm text-gray-600">18:00 - 20:00</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setStartTime('08:00');
              setEndTime('12:00');
            }}
            className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
          >
            <div className="font-medium text-gray-900">🌅 Matin</div>
            <div className="text-sm text-gray-600">08:00 - 12:00</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setStartTime('14:00');
              setEndTime('18:00');
            }}
            className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
          >
            <div className="font-medium text-gray-900">☀️ Après-midi</div>
            <div className="text-sm text-gray-600">14:00 - 18:00</div>
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Ou personnalisez :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu du créneau */}
      {formData.pickup_start && formData.pickup_end && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 mb-1">Créneau de retrait défini</p>
              <p className="text-sm text-green-700">
                {format(new Date(formData.pickup_start), "EEEE d MMMM 'de' HH:mm", { locale: fr })}{' '}
                à {format(new Date(formData.pickup_end), 'HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

