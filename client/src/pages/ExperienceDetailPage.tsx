import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

// Experience type definition
type Experience = {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
  achievements: string[];
  category: string;
  logo?: string;
};

export default function ExperienceDetailPage() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id) : null;
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { scrollToElement } = useSmoothScroll();
  
  // Fetch experience data from API
  const { data: experiences, isLoading, error } = useQuery<Experience[]>({
    queryKey: ['/api/experiences'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Find the specific experience from the array once loaded
  const experience = experiences?.find(exp => exp.id === id);
  
  // Preload logo when experience data changes
  useEffect(() => {
    if (experience?.logo) {
      setImageLoading(true);
      
      // Add cache busting for server images
      const logoSrc = experience.logo.startsWith('/uploads/') 
        ? `${experience.logo}?t=${Date.now()}` 
        : experience.logo;
      
      // Preload logo
      const img = new Image();
      img.onload = () => setImageLoading(false);
      img.onerror = () => {
        console.error(`Failed to load logo for experience ${experience.id}`);
        setImageLoading(false);
      };
      img.src = logoSrc;
      
      setImageSrc(logoSrc);
    }
  }, [experience]);
  
  // Handle navigation to contact section with smooth scrolling
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
    // Need to wait for navigation to complete before scrolling
    setTimeout(() => {
      scrollToElement("contact", { offset: 80 });
    }, 100);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-color)] mb-4" />
            <p className="text-[var(--paragraph-text)]">Loading experience details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--heading-text)] mb-4">Experience Not Found</h1>
            <p className="text-[var(--paragraph-text)] mb-6">The experience you're looking for doesn't exist or has been removed.</p>
            <Link href="/experience" className="inline-flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-6 rounded-full">
              View All Experience
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div 
            className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/experience" className="text-[var(--accent-color)] hover:underline">
                  <i className="ri-arrow-left-line"></i> All Experience
                </Link>
                <span className="text-[var(--light-text)]">/</span>
                <span className="text-[var(--paragraph-text)]">{experience.title}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--heading-text)] mb-2">
                {experience.title}
              </h1>
              <div className="flex items-center text-[var(--paragraph-text)]">
                <span className="font-medium">{experience.company}</span>
                <span className="mx-2 text-[var(--light-text)]">•</span>
                <span className="text-[var(--light-text)]">{experience.location}</span>
              </div>
            </div>
            
            <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-sm text-primary font-medium">
              {experience.period}
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Role Overview</h2>
                <div className="space-y-4 text-[var(--paragraph-text)]">
                  {experience.description.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {experience.achievements && experience.achievements.length > 0 && (
                <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Key Achievements</h2>
                  <ul className="space-y-3">
                    {experience.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex gap-3 text-[var(--paragraph-text)]">
                        <span className="text-[var(--accent-color)] mt-1 flex-shrink-0"><i className="ri-award-line"></i></span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {experience.logo && (
                <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8 mb-6">
                  <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Company</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--card-border)] bg-white relative">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
                        </div>
                      )}
                      <img 
                        src={imageSrc || experience.logo} 
                        alt={`${experience.company} logo`}
                        className="w-full h-full object-contain p-2" 
                        style={{ opacity: imageLoading ? 0 : 1 }}
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--heading-text)]">{experience.company}</h3>
                      <p className="text-[var(--light-text)]">{experience.location}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {experience.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="text-sm bg-[var(--background-gradient)]/20 text-[var(--dark-text)] px-3 py-1 rounded-full border border-[var(--card-border)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-12 flex justify-between items-center">
            <Link href="/experience" className="inline-flex items-center gap-2 text-[var(--dark-text)] border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] font-medium py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all">
              <i className="ri-arrow-left-line"></i>
              Back to Experience
            </Link>
            
            <button
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              Get in Touch
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}