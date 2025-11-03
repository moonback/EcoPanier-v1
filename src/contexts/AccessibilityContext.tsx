import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  // Mode grand texte
  largeText: boolean;
  setLargeText: (enabled: boolean) => void;
  
  // Mode contraste élevé
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  
  // Annonces vocales (screen reader)
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Taille de police personnalisée (1.0 = normal, 1.5 = 150%, etc.)
  fontSize: number;
  setFontSize: (size: number) => void;
  
  // Support multilingue - utilisé pour les annonces vocales
  translate?: (key: string, params?: Record<string, string | number>) => string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(1.0);

  // Charger les préférences depuis localStorage
  useEffect(() => {
    const savedLargeText = localStorage.getItem('kiosk_large_text') === 'true';
    const savedHighContrast = localStorage.getItem('kiosk_high_contrast') === 'true';
    const savedFontSize = parseFloat(localStorage.getItem('kiosk_font_size') || '1.0');
    
    setLargeText(savedLargeText);
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
  }, []);

  // Sauvegarder les préférences
  useEffect(() => {
    localStorage.setItem('kiosk_large_text', largeText.toString());
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('kiosk_high_contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('kiosk_font_size', fontSize.toString());
  }, [fontSize]);

  // Appliquer les styles d'accessibilité au document
  useEffect(() => {
    const root = document.documentElement;
    
    if (largeText || fontSize > 1.0) {
      root.style.fontSize = `${16 * Math.max(fontSize, largeText ? 1.25 : 1.0)}px`;
    } else {
      root.style.fontSize = '';
    }
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    return () => {
      root.style.fontSize = '';
      root.classList.remove('high-contrast');
    };
  }, [largeText, highContrast, fontSize]);

  // Fonction pour annoncer aux lecteurs d'écran
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Créer un élément aria-live pour les annonces
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      // Réinitialiser après un court délai pour permettre les annonces multiples
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        largeText,
        setLargeText,
        highContrast,
        setHighContrast,
        announce,
        fontSize,
        setFontSize,
      }}
    >
      {children}
      {/* Élément caché pour les annonces de lecteur d'écran */}
      <div
        id="aria-live-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

