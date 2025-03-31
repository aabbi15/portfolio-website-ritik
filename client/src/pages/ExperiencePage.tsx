import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import SimpleNavbar from "@/components/SimpleNavbar";
import Footer from "@/components/Footer";

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

export default function ExperiencePage() {
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [logoSources, setLogoSources] = useState<Record<number, string>>({});
  
  // Fetch experience data from API
  const { data: experiences, isLoading, error } = useQuery<Experience[]>({
    queryKey: ['/api/experiences'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Debug log
  useEffect(() => {
    console.log("ExperiencePage - Loaded data:", { experiences, isLoading, error });
  }, [experiences, isLoading, error]);

  // Preload logos when experience data changes
  useEffect(() => {
    if (!experiences) return;
    
    const newLogoSources: Record<number, string> = {};
    
    experiences.forEach(experience => {
      if (experience.logo) {
        // Set loading state
        setImageLoading(prev => ({ ...prev, [experience.id]: true }));
        
        // Add cache busting for server images
        const logoSrc = experience.logo?.startsWith('/uploads/') 
          ? `${experience.logo}?t=${Date.now()}` 
          : experience.logo;
        
        // Store logo source
        newLogoSources[experience.id] = logoSrc;
        
        // Preload logo
        const img = new Image();
        img.onload = () => setImageLoading(prev => ({ ...prev, [experience.id]: false }));
        img.onerror = () => {
          console.error(`Failed to load logo for experience ${experience.id}`);
          setImageLoading(prev => ({ ...prev, [experience.id]: false }));
        };
        img.src = logoSrc;
      }
    });
    
    setLogoSources(newLogoSources);
  }, [experiences]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleNavbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--heading-text)] mb-2">
                Professional Experience
              </h1>
              <p className="text-[var(--paragraph-text)] text-lg">
                A detailed look at my professional journey and work history
              </p>
            </div>
            
            <Link href="/#experience" className="inline-flex items-center gap-1 text-[var(--accent-color)] font-medium hover:underline">
              <i className="ri-arrow-left-line"></i>
              Back to Home
            </Link>
          </motion.div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-color)]" />
            </div>
          ) : error ? (
            <div className="text-center py-12 border rounded-lg bg-card">
              <h3 className="text-lg font-medium text-[var(--heading-text)]">Failed to load experience data</h3>
              <p className="text-[var(--paragraph-text)] mt-2">
                There was an error loading the experience information. Please try again later.
              </p>
            </div>
          ) : !experiences || experiences.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-card">
              <h3 className="text-lg font-medium text-[var(--heading-text)]">No experience found</h3>
              <p className="text-[var(--paragraph-text)] mt-2">
                Experience information will appear here once added.
              </p>
            </div>
          ) : (
            <motion.div 
              className="grid lg:grid-cols-2 gap-6 xl:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  className="glass-card border border-[var(--card-border)] rounded-xl overflow-hidden h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-6">
                      {experience.logo && (
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-[var(--card-border)] bg-white relative">
                          {imageLoading[experience.id] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-color)]" />
                            </div>
                          )}
                          <img 
                            src={logoSources[experience.id] || experience.logo} 
                            alt={`${experience.company} logo`}
                            className="w-full h-full object-contain p-2" 
                            style={{ opacity: imageLoading[experience.id] ? 0 : 1 }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-sm text-primary font-medium mb-2">
                          {experience.period}
                        </div>
                        <h2 className="text-xl font-bold text-[var(--heading-text)] mb-1">{experience.title}</h2>
                        <div className="flex items-center text-[var(--paragraph-text)]">
                          <span className="font-medium">{experience.company}</span>
                          <span className="mx-2 text-[var(--light-text)]">•</span>
                          <span className="text-[var(--light-text)]">{experience.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-semibold text-[var(--heading-text)] mb-3">Responsibilities</h3>
                      <ul className="space-y-2">
                        {experience.description.map((item, i) => (
                          <li key={i} className="flex gap-2 text-[var(--paragraph-text)]">
                            <span className="text-[var(--accent-color)] mt-1 flex-shrink-0"><i className="ri-checkbox-circle-line"></i></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {experience.achievements && experience.achievements.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-semibold text-[var(--heading-text)] mb-3">Key Achievements</h3>
                        <ul className="space-y-2">
                          {experience.achievements.map((item, i) => (
                            <li key={i} className="flex gap-2 text-[var(--paragraph-text)]">
                              <span className="text-[var(--accent-color)] mt-1 flex-shrink-0"><i className="ri-award-line"></i></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-md font-semibold text-[var(--heading-text)] mb-3">Technologies</h3>
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
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}