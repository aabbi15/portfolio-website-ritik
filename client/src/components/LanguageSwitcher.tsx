import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlobeIcon, CheckIcon } from 'lucide-react';

// Language type
type Language = {
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
};

// Create context for language
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

const defaultLanguageContext: LanguageContextType = {
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
};

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

// Hook to use language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  
  // Type guard to ensure we're always returning a valid Record<string, string>
  const safelyMergeTranslations = (prev: Record<string, string>, newTranslations: any): Record<string, string> => {
    // Ensure newTranslations is an object with string values
    if (typeof newTranslations !== 'object' || newTranslations === null) {
      return prev;
    }
    
    const result: Record<string, string> = { ...prev };
    
    // Only include entries where the value is a string
    Object.entries(newTranslations).forEach(([key, value]) => {
      if (typeof value === 'string') {
        result[key] = value;
      }
    });
    
    return result;
  };

  // Fetch available languages
  const { data: languages } = useQuery({
    queryKey: ['/api/languages'],
    queryFn: async () => {
      // For now, return mock data since we haven't implemented the API endpoint yet
      return [
        { code: 'en', name: 'English', isActive: true, isDefault: true },
        { code: 'es', name: 'Spanish', isActive: true, isDefault: false },
        { code: 'fr', name: 'French', isActive: true, isDefault: false },
        { code: 'de', name: 'German', isActive: true, isDefault: false },
      ] as Language[];
    },
  });

  // Fetch translations for current language
  const { data: langTranslations } = useQuery({
    queryKey: ['/api/translations', currentLanguage],
    queryFn: async (): Promise<Record<string, string>> => {
      // For now, return mock data since we haven't implemented the API endpoint yet
      if (currentLanguage === 'en') {
        return {
          'nav.home': 'Home',
          'nav.about': 'About',
          'nav.projects': 'Projects',
          'nav.experience': 'Experience',
          'nav.resume': 'Resume',
          'nav.blog': 'Blog',
          'nav.contact': 'Contact',
          'nav.hire': 'Hire Me',
          'hero.greeting': 'Hello, I\'m Ritik Mahyavanshi',
          'hero.title': 'Full Stack Developer & AI Specialist',
          'hero.subtitle': 'Building innovative solutions with modern technology',
          'hero.description': 'I build robust backend systems and develop intelligent AI solutions that turn complex problems into elegant, scalable software.',
          'hero.cta_work': 'View My Work',
          'hero.cta_contact': 'Contact Me',
          'about.title': 'About Me',
          'about.subtitle': 'Get To Know Me',
          'about.cta_talk': 'Let\'s Talk',
          'about.cta_resume': 'Download Resume',
          'about.skills_title': 'My Expertise',
          'about.skills_subtitle': 'Professional Skills',
          'about.expertise_label': 'Expertise',
          'about.specialization_label': 'Specialization',
          'about.education_label': 'Education',
          'about.years': 'Years',
          'about.backend_desc': 'Backend & API Development',
          'about.ai_desc': 'Machine Learning & AI',
          'about.degree': 'M.Sc. Computer Science',
          'about.degree_specialization': 'Specialization in Artificial Intelligence & Machine Learning',
          'about.category.Backend': 'Backend',
          'about.category.Frontend': 'Frontend',
          'about.category.AI/ML': 'AI/ML',
          'about.category.DevOps': 'DevOps',
          'about.category.Databases': 'Databases',
          'about.category_desc.backend': 'Server-side & API development',
          'about.category_desc.frontend': 'Client-side & UI technologies',
          'about.category_desc.ai_ml': 'Machine Learning & AI solutions',
          'about.category_desc.devops': 'Deployment & infrastructure',
          'about.category_desc.databases': 'Data storage & management',
          'about.category_desc.other': 'Programming languages & tools',
          'contact.title': 'Get in Touch',
          'contact.button': 'Send Message',
          'ui.language': 'Language',
          'ui.theme': 'Toggle theme',
          'ui.new': 'NEW',
          'site.owner_name': 'Ritik Mahyavanshi',
        };
      } else if (currentLanguage === 'es') {
        return {
          'nav.home': 'Inicio',
          'nav.about': 'Sobre Mí',
          'nav.projects': 'Proyectos',
          'nav.experience': 'Experiencia',
          'nav.resume': 'Curriculum',
          'nav.blog': 'Blog',
          'nav.contact': 'Contacto',
          'nav.hire': 'Contrátame',
          'hero.greeting': 'Hola, soy Ritik Mahyavanshi',
          'hero.title': 'Desarrollador Full Stack y Especialista en IA',
          'hero.subtitle': 'Construyendo soluciones innovadoras con tecnología moderna',
          'hero.description': 'Construyo sistemas robustos de backend y desarrollo soluciones inteligentes de IA que transforman problemas complejos en software elegante y escalable.',
          'hero.cta_work': 'Ver Mi Trabajo',
          'hero.cta_contact': 'Contáctame',
          'about.title': 'Sobre Mí',
          'about.subtitle': 'Conóceme',
          'about.cta_talk': 'Hablemos',
          'about.cta_resume': 'Descargar CV',
          'about.skills_title': 'Mi Experiencia',
          'about.skills_subtitle': 'Habilidades Profesionales',
          'about.expertise_label': 'Experiencia',
          'about.specialization_label': 'Especialización',
          'about.education_label': 'Educación',
          'about.years': 'Años',
          'about.backend_desc': 'Desarrollo Backend y API',
          'about.ai_desc': 'Machine Learning e IA',
          'about.degree': 'Máster en Informática',
          'about.degree_specialization': 'Especialización en Inteligencia Artificial y Machine Learning',
          'about.category.Backend': 'Backend',
          'about.category.Frontend': 'Frontend',
          'about.category.AI/ML': 'IA/ML',
          'about.category.DevOps': 'DevOps',
          'about.category.Databases': 'Bases de Datos',
          'about.category_desc.backend': 'Desarrollo de servidor y API',
          'about.category_desc.frontend': 'Tecnologías de cliente e interfaz',
          'about.category_desc.ai_ml': 'Soluciones de Machine Learning e IA',
          'about.category_desc.devops': 'Implementación e infraestructura',
          'about.category_desc.databases': 'Almacenamiento y gestión de datos',
          'about.category_desc.other': 'Lenguajes de programación y herramientas',
          'contact.title': 'Contacto',
          'contact.button': 'Enviar Mensaje',
          'ui.language': 'Idioma',
          'ui.theme': 'Cambiar tema',
          'ui.new': 'NUEVO',
          'site.owner_name': 'Ritik Mahyavanshi',
        };
      } else if (currentLanguage === 'fr') {
        return {
          'nav.home': 'Accueil',
          'nav.about': 'À Propos',
          'nav.projects': 'Projets',
          'nav.experience': 'Expérience',
          'nav.resume': 'CV',
          'nav.blog': 'Blog',
          'nav.contact': 'Contact',
          'nav.hire': 'Embauchez-moi',
          'hero.greeting': 'Bonjour, je suis Ritik Mahyavanshi',
          'hero.title': 'Développeur Full Stack et Spécialiste en IA',
          'hero.subtitle': 'Créer des solutions innovantes avec la technologie moderne',
          'hero.description': 'Je construis des systèmes backend robustes et je développe des solutions d\'IA intelligentes qui transforment des problèmes complexes en logiciels élégants et évolutifs.',
          'hero.cta_work': 'Voir Mon Travail',
          'hero.cta_contact': 'Me Contacter',
          'about.title': 'À Propos de Moi',
          'about.subtitle': 'Apprenez à Me Connaître',
          'about.cta_talk': 'Discutons',
          'about.cta_resume': 'Télécharger CV',
          'about.skills_title': 'Mon Expertise',
          'about.skills_subtitle': 'Compétences Professionnelles',
          'about.expertise_label': 'Expertise',
          'about.specialization_label': 'Spécialisation',
          'about.education_label': 'Formation',
          'about.years': 'Ans',
          'about.backend_desc': 'Développement Backend et API',
          'about.ai_desc': 'Machine Learning et IA',
          'about.degree': 'M.Sc. Informatique',
          'about.degree_specialization': 'Spécialisation en Intelligence Artificielle et Machine Learning',
          'about.category.Backend': 'Backend',
          'about.category.Frontend': 'Frontend',
          'about.category.AI/ML': 'IA/ML',
          'about.category.DevOps': 'DevOps',
          'about.category.Databases': 'Bases de Données',
          'about.category_desc.backend': 'Développement côté serveur et API',
          'about.category_desc.frontend': 'Technologies côté client et interface',
          'about.category_desc.ai_ml': 'Solutions de Machine Learning et IA',
          'about.category_desc.devops': 'Déploiement et infrastructure',
          'about.category_desc.databases': 'Stockage et gestion des données',
          'about.category_desc.other': 'Langages de programmation et outils',
          'contact.title': 'Me Contacter',
          'contact.button': 'Envoyer Message',
          'ui.language': 'Langue',
          'ui.theme': 'Changer de thème',
          'ui.new': 'NOUVEAU',
          'site.owner_name': 'Ritik Mahyavanshi',
        };
      } else if (currentLanguage === 'de') {
        return {
          'nav.home': 'Startseite',
          'nav.about': 'Über Mich',
          'nav.projects': 'Projekte',
          'nav.experience': 'Erfahrung',
          'nav.resume': 'Lebenslauf',
          'nav.blog': 'Blog',
          'nav.contact': 'Kontakt',
          'nav.hire': 'Beauftragen Sie mich',
          'hero.greeting': 'Hallo, ich bin Ritik Mahyavanshi',
          'hero.title': 'Full-Stack-Entwickler & KI-Spezialist',
          'hero.subtitle': 'Innovative Lösungen mit moderner Technologie entwickeln',
          'hero.description': 'Ich entwickle robuste Backend-Systeme und intelligente KI-Lösungen, die komplexe Probleme in elegante, skalierbare Software umwandeln.',
          'hero.cta_work': 'Meine Arbeit ansehen',
          'hero.cta_contact': 'Kontaktieren Sie mich',
          'about.title': 'Über Mich',
          'about.subtitle': 'Lernen Sie mich kennen',
          'about.cta_talk': 'Sprechen wir',
          'about.cta_resume': 'Lebenslauf herunterladen',
          'about.skills_title': 'Meine Fachgebiete',
          'about.skills_subtitle': 'Berufliche Kenntnisse',
          'about.expertise_label': 'Expertise',
          'about.specialization_label': 'Spezialisierung',
          'about.education_label': 'Ausbildung',
          'about.years': 'Jahre',
          'about.backend_desc': 'Backend- und API-Entwicklung',
          'about.ai_desc': 'Machine Learning & KI',
          'about.degree': 'M.Sc. Informatik',
          'about.degree_specialization': 'Spezialisierung auf Künstliche Intelligenz und Maschinelles Lernen',
          'about.category.Backend': 'Backend',
          'about.category.Frontend': 'Frontend',
          'about.category.AI/ML': 'KI/ML',
          'about.category.DevOps': 'DevOps',
          'about.category.Databases': 'Datenbanken',
          'about.category_desc.backend': 'Serverseitige & API-Entwicklung',
          'about.category_desc.frontend': 'Clientseitige & UI-Technologien',
          'about.category_desc.ai_ml': 'Machine Learning & KI-Lösungen',
          'about.category_desc.devops': 'Bereitstellung & Infrastruktur',
          'about.category_desc.databases': 'Datenspeicherung & -verwaltung',
          'about.category_desc.other': 'Programmiersprachen & Werkzeuge',
          'contact.title': 'Kontakt Aufnehmen',
          'contact.button': 'Nachricht Senden',
          'ui.language': 'Sprache',
          'ui.theme': 'Thema ändern',
          'ui.new': 'NEU',
          'site.owner_name': 'Ritik Mahyavanshi',
        };
      }
      
      return {};
    },
  });

  // Update translations when language changes
  useEffect(() => {
    if (langTranslations) {
      setTranslations(prev => safelyMergeTranslations(prev, langTranslations));
    }
  }, [langTranslations]);

  // Detect browser language on initial load
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (languages) {
      const activeLangs = languages.filter(lang => lang.isActive).map(lang => lang.code);
      if (activeLangs.includes(browserLang)) {
        setCurrentLanguage(browserLang);
      } else {
        // Find default language
        const defaultLang = languages.find(lang => lang.isDefault);
        if (defaultLang) {
          setCurrentLanguage(defaultLang.code);
        }
      }
    }
  }, [languages]);

  // Set language function
  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    // Store in localStorage for persistence
    localStorage.setItem('language', code);
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Language switcher component
export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage();

  // Fetch available languages
  const { data: languages, isLoading } = useQuery({
    queryKey: ['/api/languages'],
    queryFn: async () => {
      // For now, return mock data since we haven't implemented the API endpoint yet
      return [
        { code: 'en', name: 'English', isActive: true, isDefault: true },
        { code: 'es', name: 'Spanish', isActive: true, isDefault: false },
        { code: 'fr', name: 'French', isActive: true, isDefault: false },
        { code: 'de', name: 'German', isActive: true, isDefault: false },
      ] as Language[];
    },
  });

  if (isLoading || !languages || languages.length <= 1) {
    return null;
  }

  const activeLanguages = languages.filter(lang => lang.isActive);
  const currentLangInfo = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2 text-xs">
          <GlobeIcon className="h-3.5 w-3.5 mr-1" />
          <span className="capitalize">{currentLangInfo?.name || currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {activeLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex justify-between items-center"
          >
            <span>{language.name}</span>
            {language.code === currentLanguage && (
              <CheckIcon className="h-4 w-4 ml-2 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}