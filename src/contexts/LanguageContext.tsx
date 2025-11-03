import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'es' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Charger les traductions dynamiquement
const translations: Record<Language, any> = {} as Record<Language, any>;

async function loadTranslations(lang: Language): Promise<any> {
  if (translations[lang]) {
    return translations[lang];
  }

  try {
    const module = await import(`../locales/${lang}.json`);
    translations[lang] = module.default;
    return translations[lang];
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    // Fallback vers français
    if (lang !== 'fr') {
      const frModule = await import('../locales/fr.json');
      translations.fr = frModule.default;
      return translations.fr;
    }
    return {};
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [currentTranslations, setCurrentTranslations] = useState<any>({});

  // Détecter la langue du navigateur
  useEffect(() => {
    const savedLang = localStorage.getItem('kiosk_language') as Language | null;
    const browserLang = navigator.language.split('-')[0] as Language;
    
    const initialLang: Language = savedLang || (['fr', 'en', 'es', 'ar'].includes(browserLang) ? browserLang : 'fr');
    setLanguageState(initialLang);
  }, []);

  // Charger les traductions
  useEffect(() => {
    let isMounted = true;

    loadTranslations(language).then((trans) => {
      if (isMounted) {
        setCurrentTranslations(trans);
        setTranslationsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  // Appliquer la direction du texte
  const direction: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
    return () => {
      document.documentElement.removeAttribute('dir');
      document.documentElement.removeAttribute('lang');
    };
  }, [direction, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kiosk_language', lang);
  };

  // Fonction de traduction avec support des paramètres
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translationsLoaded) {
      return key;
    }

    const keys = key.split('.');
    let value: any = currentTranslations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback vers la clé si la traduction n'existe pas
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Remplacer les paramètres {param} par leurs valeurs
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        const paramValue = params[paramKey];
        if (paramValue !== undefined) {
          return String(paramValue);
        }
        return match;
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        direction,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

