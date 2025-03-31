import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, MapPin, Briefcase } from "lucide-react";

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

// Animation variants
const cardVariants: Variants = {
  initial: { 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
  },
  hover: { 
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    y: -5,
    transition: {
      y: { type: "spring", stiffness: 300, damping: 15 },
      boxShadow: { duration: 0.3 }
    }
  }
};

const detailsVariants: Variants = {
  initial: { opacity: 0, height: 0 },
  hover: { 
    opacity: 1, 
    height: "auto",
    transition: {
      height: { duration: 0.3 }, 
      opacity: { duration: 0.2, delay: 0.1 } 
    }
  }
};

const iconVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.15,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10,
      repeat: Infinity,
      repeatType: "reverse",
      duration: 0.8
    } 
  }
};

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [logoSources, setLogoSources] = useState<Record<number, string>>({});
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Fetch experience data from API
  const { data: experiences, isLoading, error } = useQuery<Experience[]>({
    queryKey: ['/api/experiences'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    <section id="experience" ref={sectionRef} className="py-16 md:py-24 relative">
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
            <p className="text-primary font-medium text-sm">Work History</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold">
            <span className="gradient-text">My Experience</span>
          </h2>
        </motion.div>
        
        <div className="max-w-5xl mx-auto">
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
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-[var(--card-border)] transform md:translate-x-0 translate-x-[7px]"></div>
              
              {/* Experience items */}
              {experiences.slice(0, 3).map((experience, index) => (
                <motion.div 
                  key={experience.id}
                  className={`relative mb-12 md:mb-16 ${index % 2 === 0 ? 'md:pr-12 ml-4 md:ml-0' : 'md:pl-12 md:ml-auto ml-4'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  style={{ width: '100%', maxWidth: 'calc(50% - 1.5rem)' }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 top-0 w-3.5 h-3.5 rounded-full bg-[var(--accent-color)] transform -translate-x-[7px] md:-translate-x-1/2 z-10 shadow-md"></div>
                  
                  {/* Date badge - removed because it's now included in the card */}
                  
                  <motion.div 
                    className="glass-card p-6 rounded-xl border border-[var(--card-border)] mt-8 relative overflow-hidden"
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    onHoverStart={() => setHoveredCard(experience.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    {/* Top info section */}
                    <div className="flex flex-col mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        {experience.logo && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center relative">
                            {imageLoading[experience.id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                                <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-color)]" />
                              </div>
                            )}
                            <img 
                              src={logoSources[experience.id] || experience.logo} 
                              alt={`${experience.company} logo`}
                              className="w-full h-full object-contain p-1"
                              style={{ opacity: imageLoading[experience.id] ? 0 : 1 }}
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-[var(--heading-text)]">{experience.title}</h3>
                          <div className="flex items-center">
                            <span className="text-[var(--paragraph-text)] font-medium">{experience.company}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Info badges with icons */}
                      <div className="flex flex-wrap gap-4 mb-4 text-[var(--light-text)] text-sm">
                        <motion.div 
                          className="flex items-center gap-1"
                          variants={iconVariants}
                          animate={hoveredCard === experience.id ? "hover" : "initial"}
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{experience.period}</span>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center gap-1"
                          variants={iconVariants}
                          animate={hoveredCard === experience.id ? "hover" : "initial"}
                        >
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{experience.location}</span>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-[var(--paragraph-text)] mb-4">
                      {experience.description[0]}
                      {experience.description.length > 1 && '...'}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {experience.technologies.slice(0, 4).map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {experience.technologies.length > 4 && (
                        <span className="text-xs bg-[var(--card-bg)] text-[var(--light-text)] px-2 py-1 rounded-full">
                          +{experience.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    {/* Additional details that appear on hover */}
                    <AnimatePresence>
                      {hoveredCard === experience.id && (
                        <motion.div 
                          className="overflow-hidden"
                          variants={detailsVariants}
                          initial="initial"
                          animate="hover"
                          exit="initial"
                        >
                          <div className="pt-2 border-t border-[var(--card-border)] mt-2">
                            <h4 className="text-sm font-semibold text-[var(--heading-text)] mb-2 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              Key Achievements
                            </h4>
                            <ul className="list-disc list-inside text-sm text-[var(--paragraph-text)] mb-4">
                              {experience.achievements.slice(0, 2).map((achievement, i) => (
                                <li key={i} className="mb-1">{achievement}</li>
                              ))}
                              {experience.achievements.length > 2 && (
                                <li className="text-[var(--light-text)]">+ {experience.achievements.length - 2} more achievements</li>
                              )}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* View details link */}
                    <div className="mt-3">
                      <Link 
                        href={`/experience/${experience.id}`} 
                        className="text-sm font-medium text-[var(--accent-color)] hover:underline inline-flex items-center gap-1 group"
                      >
                        View details
                        <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!isLoading && !error && experiences && experiences.length > 0 && (
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                href="/experience" 
                className="inline-flex items-center gap-2 bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] text-[var(--dark-text)] font-medium py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all group"
              >
                View All Experience
                <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}