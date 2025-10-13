import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

/**
 * Composant pour gérer dynamiquement les métadonnées SEO
 * Utilise l'API Document pour modifier les balises meta
 */
export function SEOHead({
  title = 'EcoPanier - Plateforme Solidaire Anti-gaspillage Alimentaire',
  description = 'EcoPanier connecte commerçants et consommateurs pour lutter contre le gaspillage alimentaire. Achetez des lots d\'invendus à prix réduits, offrez des paniers suspendus et participez à la solidarité alimentaire.',
  keywords = 'anti-gaspillage, alimentaire, solidarité, panier suspendu, invendus, écologie, développement durable, commerce local, économie circulaire, France',
  image = 'https://ecopanier.fr/logo.png',
  url = 'https://ecopanier.fr',
  type = 'website',
  noindex = false
}: SEOHeadProps) {
  
  useEffect(() => {
    // Titre de la page
    document.title = title;
    
    // Meta description
    updateMetaTag('description', description);
    
    // Meta keywords
    updateMetaTag('keywords', keywords);
    
    // Robots
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    
    // Open Graph
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:image', image);
    updateMetaProperty('og:url', url);
    updateMetaProperty('og:type', type);
    
    // Twitter Card
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    updateMetaName('twitter:image', image);
    
    // Canonical URL
    updateCanonicalUrl(url);
    
  }, [title, description, keywords, image, url, type, noindex]);

  return null; // Ce composant ne rend rien visuellement
}

/**
 * Met à jour une balise meta par name
 */
function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

/**
 * Met à jour une balise meta par property (Open Graph)
 */
function updateMetaProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

/**
 * Met à jour une balise meta Twitter par name
 */
function updateMetaName(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

/**
 * Met à jour l'URL canonique
 */
function updateCanonicalUrl(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}
