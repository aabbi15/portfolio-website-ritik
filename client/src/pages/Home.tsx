import { useEffect, useState, useMemo } from "react";
import SimpleNavbar from "@/components/SimpleNavbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { motion } from "framer-motion";
import SEOHead from "@/components/ui/seo-head";

export default function Home() {
  const { scrollToElement } = useSmoothScroll();
  const [scrollY, setScrollY] = useState(0);
  
  // SEO structured data for personal portfolio
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": "Ritik Mahyavanshi",
        "jobTitle": "Full Stack Developer & AI Specialist",
        "url": "https://ritikmahyavanshi.com",
        "sameAs": [
          "https://github.com/ritikmahyavanshi",
          "https://linkedin.com/in/ritikmahyavanshi"
        ],
        "knowsAbout": [
          "Full Stack Development",
          "JavaScript",
          "React",
          "Node.js",
          "Artificial Intelligence",
          "Machine Learning"
        ]
      }
    };
  }, []);
  
  // Handle smooth scrolling and navigation
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href')?.substring(1) || '';
        
        if (targetId) {
          scrollToElement(targetId, { offset: 80 });
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    // Set active nav link on scroll and update scroll position
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      let current = '';
      
      setScrollY(window.scrollY);
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = '#' + section.getAttribute('id')!;
        }
      });
      
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === current) {
          link.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollToElement]);
  
  // Scroll indicator animation
  const scrollProgress = Math.min(scrollY / 300, 1);
  
  return (
    <>
      {/* SEO Optimization */}
      <SEOHead 
        title="Ritik Mahyavanshi | Full Stack Developer & AI Specialist Portfolio"
        description="Full stack developer and AI specialist with expertise in React, Node.js, and machine learning. Explore my projects, experience, and technical insights."
        keywords="full stack developer, web development, AI, machine learning, JavaScript, React, Node.js, portfolio, technical blog"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1633332755192-727a05c4013d"
        canonical="https://ritikmahyavanshi.com"
        structuredData={structuredData}
      />
    
      <AnimatedBackground 
        count={30} 
        speed={0.3} 
        opacity={0.2} 
      />
      
      {/* Scroll indicator */}
      <motion.div 
        className="fixed left-0 top-0 h-1 bg-gradient-to-r from-primary via-accent-color to-primary z-50"
        style={{ 
          width: `${scrollProgress * 100}%`,
          opacity: scrollProgress 
        }}
        initial={{ width: 0 }}
        animate={{ width: `${scrollProgress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
      
      <SimpleNavbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <BlogSection />
        <TestimonialsSection />
        <NewsletterSection />
        <ContactSection />
      </main>
      <Footer />
      
      {/* Scroll to top button */}
      {scrollY > 500 && (
        <motion.button
          className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg z-40"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </motion.button>
      )}
    </>
  );
}
