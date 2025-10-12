import { useState, useEffect } from 'react';
import { Clock, Save, X } from 'lucide-react';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface BusinessHoursEditorProps {
  value: Record<string, DayHours> | null;
  onChange: (hours: BusinessHours) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '08:00', close: '20:00', closed: false },
  tuesday: { open: '08:00', close: '20:00', closed: false },
  wednesday: { open: '08:00', close: '20:00', closed: false },
  thursday: { open: '08:00', close: '20:00', closed: false },
  friday: { open: '08:00', close: '20:00', closed: false },
  saturday: { open: '09:00', close: '19:00', closed: false },
  sunday: { open: '', close: '', closed: true }
};

const DAY_NAMES: Record<keyof BusinessHours, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

export function BusinessHoursEditor({ value, onChange, onSave, onCancel, saving = false }: BusinessHoursEditorProps) {
  const [hours, setHours] = useState<BusinessHours>(
    value ? (value as BusinessHours) : DEFAULT_HOURS
  );

  useEffect(() => {
    if (value) {
      setHours(value as BusinessHours);
    }
  }, [value]);

  const handleDayChange = (day: keyof BusinessHours, field: 'open' | 'close' | 'closed', val: string | boolean) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: val
      }
    };
    setHours(newHours);
    onChange(newHours);
  };

  const handleCopyToAll = (day: keyof BusinessHours) => {
    const dayHours = hours[day];
    const newHours = { ...hours };
    
    Object.keys(newHours).forEach(key => {
      if (key !== 'sunday') { // Ne pas copier sur le dimanche par défaut
        newHours[key as keyof BusinessHours] = { ...dayHours };
      }
    });
    
    setHours(newHours);
    onChange(newHours);
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Horaires d'ouverture</h3>
            <p className="text-sm text-neutral-600">Définissez vos horaires d'ouverture hebdomadaires</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="btn-secondary rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="btn-primary rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(hours) as Array<keyof BusinessHours>).map((day) => (
          <div
            key={day}
            className={`p-4 rounded-xl border-2 transition-all ${
              hours[day].closed
                ? 'bg-neutral-50 border-neutral-200'
                : 'bg-white border-primary-100'
            }`}
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Nom du jour */}
              <div className="w-28 flex-shrink-0">
                <label className="font-semibold text-neutral-900">{DAY_NAMES[day]}</label>
              </div>

              {/* Checkbox fermé */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours[day].closed}
                  onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 font-medium">Fermé</span>
              </label>

              {/* Horaires */}
              {!hours[day].closed && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-600">Ouverture</label>
                    <input
                      type="time"
                      value={hours[day].open}
                      onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                      className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-600">Fermeture</label>
                    <input
                      type="time"
                      value={hours[day].close}
                      onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                      className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Bouton copier */}
                  <button
                    onClick={() => handleCopyToAll(day)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                  >
                    Copier sur tous les jours
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Informations utiles */}
      <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-2 text-sm">💡 Conseils</h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Les horaires s'affichent sur votre page commerçant</li>
          <li>• Ils aident les clients à planifier leurs retraits</li>
          <li>• Vous pouvez modifier vos horaires à tout moment</li>
          <li>• Utilisez "Copier sur tous les jours" pour des horaires identiques</li>
        </ul>
      </div>
    </div>
  );
}

