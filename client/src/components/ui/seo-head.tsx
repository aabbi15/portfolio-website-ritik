import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonical?: string;
  structuredData?: Record<string, any>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  language?: string;
  twitterCard?: string;
  robots?: string;
}

/**
 * A component to dynamically update the page's meta tags for SEO
 */
export default function SEOHead({
  title,
  description,
  keywords,
  ogType = 'website',
  ogImage,
  canonical,
  structuredData,
  author = 'Ritik Mahyavanshi',
  publishedTime,
  modifiedTime,
  language = 'en-US',
  twitterCard = 'summary_large_image',
  robots = 'index, follow'
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('robots', robots);
    updateMetaTag('author', author);
    updateMetaTag('language', language);
    
    // Set HTML lang attribute
    document.documentElement.setAttribute('lang', language.split('-')[0]);

    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    if (ogImage) updateMetaTag('og:image', ogImage, 'property');
    if (canonical) updateMetaTag('og:url', canonical, 'property');
    updateMetaTag('og:site_name', 'Ritik Mahyavanshi Portfolio', 'property');
    if (publishedTime) updateMetaTag('og:published_time', publishedTime, 'property');
    if (modifiedTime) updateMetaTag('og:modified_time', modifiedTime, 'property');
    
    // Update Twitter tags
    updateMetaTag('twitter:card', twitterCard, 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    if (ogImage) updateMetaTag('twitter:image', ogImage, 'name');
    updateMetaTag('twitter:creator', '@ritikmahyavanshi', 'name');
    
    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonical);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonical);
        document.head.appendChild(canonicalLink);
      }
    }

    // Add structured data for better rich snippets in search results
    if (structuredData) {
      let structuredDataScript = document.getElementById('structured-data');
      if (structuredDataScript) {
        structuredDataScript.innerHTML = JSON.stringify(structuredData);
      } else {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'structured-data';
        structuredDataScript.setAttribute('type', 'application/ld+json');
        structuredDataScript.innerHTML = JSON.stringify(structuredData);
        document.head.appendChild(structuredDataScript);
      }
    }

    return () => {
      // Clean up structured data when component unmounts
      if (structuredData) {
        const script = document.getElementById('structured-data');
        if (script) script.remove();
      }
    };
  }, [title, description, keywords, ogType, ogImage, canonical, structuredData, author, publishedTime, modifiedTime, language, twitterCard, robots]);

  // Helper function to update meta tags
  const updateMetaTag = (name: string, content: string, attributeName: string = 'name') => {
    let metaTag = document.querySelector(`meta[${attributeName}="${name}"]`);
    if (metaTag) {
      metaTag.setAttribute('content', content);
    } else {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attributeName, name);
      metaTag.setAttribute('content', content);
      document.head.appendChild(metaTag);
    }
  };

  // Component doesn't render anything visible
  return null;
}