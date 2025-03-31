import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useLanguage } from "./LanguageSwitcher";

// Define the content type
type SiteContent = {
  id: number;
  section: string;
  key: string;
  value: string;
  type: string;
};

export default function AboutSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState("");
  
  // Fetch content from API
  const { data: contentItems, isLoading } = useQuery<SiteContent[]>({
    queryKey: ['/api/content'],
  });

  // Extract about section content
  const aboutContent = contentItems?.filter(item => item.section === 'about') || [];
  
  // Get individual content pieces or use defaults
  const title = aboutContent.find(item => item.key === 'title')?.value || 'Full Stack Developer & AI Engineer';
  const bio = aboutContent.find(item => item.key === 'bio')?.value || 'I\'m a passionate full stack developer with a strong focus on backend development and AI/ML systems. With extensive expertise in Python, Node.js, and database design, I build robust, scalable, and high-performance applications that solve complex problems.';
  const degree = aboutContent.find(item => item.key === 'degree')?.value || 'MS in Computer Science';
  const degreeSpecialization = aboutContent.find(item => item.key === 'degree_specialization')?.value || 'Northeastern University, Silicon Valley';
  const degreePeriod = aboutContent.find(item => item.key === 'degree_period')?.value || 'Sep\'25 to May\'27';
  
  // For image source
  const rawPhotoUrl = aboutContent.find(item => item.key === 'photo')?.value || 
    "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1161&q=80";
  
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
  
  return (
    <section id="about" ref={sectionRef} className="py-16 md:py-24 relative">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--background-gradient)] to-transparent -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[var(--background-gradient)] to-transparent -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <p className="text-primary font-medium text-sm">{t('about.subtitle', 'Get To Know Me')}</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold">
            <span className="gradient-text">{t('about.title', 'About Me')}</span>
          </h2>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-primary/20 to-[var(--accent-color)]/20 opacity-70 blur-3xl -z-10"></div>
              
              <div className="glass-morph rounded-2xl p-3 shadow-2xl relative z-10">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)] rounded-xl">
                    <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-[var(--accent-color)]" />
                  </div>
                )}
                <img 
                  src={imageSrc}
                  alt="Developer working on code with machine learning visualizations" 
                  className="rounded-xl shadow-inner w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] object-cover"
                  onLoad={() => setImageLoading(false)}
                  style={{ opacity: imageLoading ? 0 : 1 }}
                />
              </div>
              
              {/* Stats decorative elements removed */}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="lg:pl-10"
          >
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-6 section-title inline-block pb-3">
              {title}
            </h3>
            
            <p className="text-[var(--paragraph-text)] mb-6 leading-relaxed text-lg">
              {bio}
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="highlight-box"
              >
                <div className="glass-card p-6 hover:shadow-lg transition-all h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                      <i className="ri-code-s-slash-line text-2xl text-primary"></i>
                    </div>
                    <h4 className="text-lg font-heading font-semibold text-[var(--heading-text)]">{t('about.expertise_label', 'Expertise')}</h4>
                  </div>
                  <p className="text-[var(--paragraph-text)]">
                    <span className="text-xl font-bold text-[var(--heading-text)]">{t('about.backend_desc', 'Backend & API Development')}</span>
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="highlight-box"
              >
                <div className="glass-card p-6 hover:shadow-lg transition-all h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                      <i className="ri-brain-fill text-2xl text-primary"></i>
                    </div>
                    <h4 className="text-lg font-heading font-semibold text-[var(--heading-text)]">{t('about.specialization_label', 'Specialization')}</h4>
                  </div>
                  <p className="text-[var(--paragraph-text)]">
                    <span className="text-xl font-bold text-[var(--heading-text)]">{t('about.ai_desc', 'Machine Learning & AI')}</span>
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="highlight-box mb-10"
            >
              <div className="glass-card p-6 hover:shadow-lg transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                    <i className="ri-graduation-cap-fill text-2xl text-primary"></i>
                  </div>
                  <h4 className="text-lg font-heading font-semibold text-[var(--heading-text)]">{t('about.education_label', 'Education')}</h4>
                </div>
                <p className="text-[var(--paragraph-text)]">
                  <span className="text-xl font-bold text-[var(--heading-text)]">{degree}</span><br />
                  {degreeSpecialization}<br />
                  <span className="text-sm text-primary/80 font-semibold">{degreePeriod}</span>
                </p>
              </div>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a 
                href="#contact" 
                className="inline-flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {t('about.cta_talk', 'Let\'s Talk')}
                <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
              </motion.a>
              
              <motion.a 
                href="#" 
                download
                className="inline-flex items-center justify-center gap-2 text-[var(--dark-text)] border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] font-medium py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                {t('about.cta_resume', 'Download Resume')}
                <i className="ri-download-line transition-transform group-hover:translate-y-1"></i>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}