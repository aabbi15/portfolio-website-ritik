import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, ArrowDown, Github, Linkedin, Twitter } from "lucide-react";
import { useLanguage } from "./LanguageSwitcher";
import TypedText from "@/components/ui/TypedText";
import FloatingElements from "@/components/ui/FloatingElements";
import ScrollReveal from "@/components/ui/ScrollReveal";

// Define the content type
type SiteContent = {
  id: number;
  section: string;
  key: string;
  value: string;
  type: string;
};

export default function HeroSection() {
  const { t } = useLanguage();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState("");
  
  // Fetch content from API
  const { data: contentItems, isLoading } = useQuery<SiteContent[]>({
    queryKey: ['/api/content'],
  });

  // Extract hero section content
  const heroContent = contentItems?.filter(item => item.section === 'hero') || [];
  
  // Get individual content pieces or use defaults
  const name = heroContent.find(item => item.key === 'name')?.value || 'Ritik Mahyavanshi';
  const role = heroContent.find(item => item.key === 'role')?.value || 'Full Stack Developer & AI Specialist';
  
  // For image, add cache busting with a timestamp
  const rawPhotoUrl = heroContent.find(item => item.key === 'photo')?.value || 
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80";
  
  // Handle image path and loading state
  useEffect(() => {
    if (rawPhotoUrl) {
      setImageLoading(true);
      // Add cache busting only for server-hosted images
      const finalUrl = rawPhotoUrl.startsWith('/uploads/') 
        ? `${rawPhotoUrl}?t=${Date.now()}` // Add timestamp to prevent caching
        : rawPhotoUrl;
      setImageSrc(finalUrl);
      
      // Pre-load the image to ensure it's in cache
      const img = new Image();
      img.onload = () => setImageLoading(false);
      img.onerror = () => {
        console.error("Failed to load image:", finalUrl);
        setImageLoading(false);
      };
      img.src = finalUrl;
    }
  }, [rawPhotoUrl]);
  
  // Split role into parts if needed
  const [primaryRole, secondaryRole] = role.includes('&') 
    ? role.split('&').map(r => r.trim()) 
    : [role, 'Backend & AI Specialist'];

  // Define typed text options
  const typedTexts = [
    "Python",
    "Node.js",
    "TensorFlow",
    "Express",
    "Deep Learning",
    "REST APIs",
    "PostgreSQL",
    "AWS",
    "MongoDB",
    "AI Solutions"
  ];

  return (
    <section id="home" className="relative min-h-screen pt-24 pb-16 md:pt-32 bg-[var(--hero-bg)] hero-section">
      {/* Floating elements in background */}
      <FloatingElements count={6} minSize={30} maxSize={120} className="opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between md:gap-12 mb-10 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left md:flex-1 mt-8 md:mt-0"
          >
            <ScrollReveal from="bottom" delay={0.1}>
              <p className="text-[var(--accent-color)] font-medium text-base sm:text-lg mb-2 sm:mb-4">
                {t('hero.greeting', `Hello, I'm ${name}`)}
              </p>
            </ScrollReveal>

            <ScrollReveal from="bottom" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-semibold tracking-tight mb-3 sm:mb-5">
                <span className="text-[var(--dark-text)] hero-title">{t('hero.title', primaryRole)}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal from="bottom" delay={0.3}>
              <h2 className="text-xl sm:text-2xl md:text-3xl text-[var(--light-text)] font-light mb-6 sm:mb-10">
                {t('hero.subtitle', secondaryRole)}
              </h2>
            </ScrollReveal>

            <ScrollReveal from="bottom" delay={0.4}>
              <div className="text-[var(--light-text)] text-base sm:text-lg md:text-xl max-w-xl mb-8 sm:mb-12 leading-relaxed">
                <p className="mb-2">
                  {t('hero.description', 'I build robust backend systems and develop intelligent AI solutions that turn complex problems into elegant, scalable software.')}
                </p>
                <div className="flex items-center gap-2 text-base sm:text-lg text-[var(--accent-color)] mt-4">
                  <span className="font-medium">{t('hero.expertise', 'Expertise')}:</span>
                  <TypedText 
                    texts={typedTexts} 
                    typingSpeed={70} 
                    deletingSpeed={40} 
                    className="font-medium"
                    cursorClassName="text-[var(--accent-color)]"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal from="bottom" delay={0.5}>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 sm:gap-5 mb-8 sm:mb-12 md:mb-0">
                <motion.a
                  href="#projects"
                  className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-6 sm:px-8 rounded-full transition-all text-center sm:text-left"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('hero.cta_work', 'View My Work')}
                </motion.a>
                <motion.a
                  href="#contact"
                  className="text-[var(--dark-text)] border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] font-medium py-3 px-6 sm:px-8 rounded-full transition-all text-center sm:text-left mt-3 sm:mt-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('hero.cta_contact', 'Contact Me')}
                </motion.a>
              </div>
            </ScrollReveal>
          </motion.div>
          
          <ScrollReveal from="right" delay={0.2}>
            <div className="mb-6 sm:mb-12 md:mb-0 md:flex-1">
              <div className="relative mx-auto max-w-[200px] sm:max-w-xs md:max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-color)]/20 to-blue-500/20 rounded-full transform scale-105 blur-xl animate-pulse"></div>
                <motion.div 
                  className="relative overflow-hidden rounded-full border-4 border-[var(--card-bg)] shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                      <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-[var(--accent-color)]" />
                    </div>
                  )}
                  <img
                    src={imageSrc}
                    alt={`${name} - ${primaryRole}`}
                    className="w-full h-auto transition-opacity duration-300"
                    onLoad={() => setImageLoading(false)}
                    style={{ opacity: imageLoading ? 0 : 1 }}
                  />
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal from="bottom" delay={0.6}>
          <div className="relative mx-auto max-w-4xl">
            {/* Social Links Bar */}
            <motion.div 
              className="flex gap-5 bg-[var(--card-bg)] px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg border border-[var(--card-border)] mx-auto w-fit social-links-bar"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-[var(--light-text)] hover:text-[var(--accent-color)] transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[var(--light-text)] hover:text-[var(--accent-color)] transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-[var(--light-text)] hover:text-[var(--accent-color)] transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.a>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll down indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={() => {
          const aboutSection = document.getElementById('about');
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <span className="text-sm font-medium mb-2 text-[var(--light-text)]">{t('hero.scroll_down', 'Scroll Down')}</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowDown className="w-5 h-5 text-[var(--accent-color)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
