import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Project type definition
type Project = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  technologies: string[];
  tags: string[];
  link: string;
};

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  
  // Fetch projects from API
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle image loading
  const handleImageLoad = (projectId: number) => {
    setImageLoading(prev => ({ ...prev, [projectId]: false }));
  };

  const handleImageError = (projectId: number) => {
    console.error(`Failed to load image for project ${projectId}`);
    setImageLoading(prev => ({ ...prev, [projectId]: false }));
  };
  
  // Pre-load images
  const preloadImage = (project: Project) => {
    // Set loading state for this image
    setImageLoading(prev => ({ ...prev, [project.id]: true }));
    
    // Create and load image 
    const img = new Image();
    img.onload = () => handleImageLoad(project.id);
    img.onerror = () => handleImageError(project.id);
    
    // Add cache busting for server images
    const imgSrc = project.image.startsWith('/uploads/') 
      ? `${project.image}?t=${Date.now()}` 
      : project.image;
    
    img.src = imgSrc;
    return imgSrc;
  };
  
  return (
    <section id="projects" ref={sectionRef} className="py-10 sm:py-16 md:py-24 relative">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--background-gradient)] to-transparent -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[var(--background-gradient)] to-transparent -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-3 sm:mb-4">
            <p className="text-primary font-medium text-xs sm:text-sm">My Recent Work</p>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
            <span className="gradient-text">Featured Projects</span>
          </h2>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12 sm:py-16">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-[var(--accent-color)]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 border rounded-lg bg-card">
            <h3 className="text-base sm:text-lg font-medium text-[var(--heading-text)]">Failed to load projects</h3>
            <p className="text-sm sm:text-base text-[var(--paragraph-text)] mt-2">
              There was an error loading the projects. Please try again later.
            </p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-8 sm:py-12 border rounded-lg bg-card">
            <h3 className="text-base sm:text-lg font-medium text-[var(--heading-text)]">No projects found</h3>
            <p className="text-sm sm:text-base text-[var(--paragraph-text)] mt-2">
              Projects will appear here once they are added.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {projects.slice(0, 3).map((project, index) => {
              // Preload image
              const imageSrc = preloadImage(project);
              
              return (
                <motion.div
                  key={project.id}
                  className="glass-card border border-[var(--card-border)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    {imageLoading[project.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[var(--accent-color)]" />
                      </div>
                    )}
                    <img 
                      src={imageSrc} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      style={{ opacity: imageLoading[project.id] ? 0 : 1 }}
                      onLoad={() => handleImageLoad(project.id)}
                      onError={() => handleImageError(project.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 sm:p-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {project.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex} 
                            className="text-[10px] sm:text-xs bg-white/20 text-white backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--heading-text)] mb-1 sm:mb-2">{project.title}</h3>
                    <p className="text-sm sm:text-base text-[var(--paragraph-text)] mb-3 sm:mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {project.technologies.slice(0, 4).map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <Link href={`/projects/${project.id}`} className="text-xs sm:text-sm font-medium text-[var(--accent-color)] hover:underline inline-flex items-center gap-1">
                        View details
                        <i className="ri-arrow-right-line"></i>
                      </Link>
                      
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-medium text-[var(--paragraph-text)] hover:text-[var(--dark-text)] inline-flex items-center gap-1"
                      >
                        <i className="ri-external-link-line"></i>
                        Live demo
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <motion.div 
          className="text-center mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            href="/projects" 
            className="inline-flex items-center gap-2 bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] text-[var(--dark-text)] font-medium py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-sm hover:shadow-md transition-all group"
          >
            View All Projects
            <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}