import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

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

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id) : null;
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { scrollToElement } = useSmoothScroll();
  
  // Fetch projects from API
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Find the specific project from the array once loaded
  const project = projects?.find(proj => proj.id === id);
  
  // Preload the project image when data is available
  useEffect(() => {
    if (project?.image) {
      setImageLoading(true);
      
      // Add cache busting for server images
      const imgSrc = project.image.startsWith('/uploads/') 
        ? `${project.image}?t=${Date.now()}` 
        : project.image;
      
      // Preload image
      const img = new Image();
      img.onload = () => setImageLoading(false);
      img.onerror = () => {
        console.error(`Failed to load image for project ${project.id}`);
        setImageLoading(false);
      };
      img.src = imgSrc;
      
      setImageSrc(imgSrc);
    }
  }, [project]);
  
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
            <p className="text-[var(--paragraph-text)]">Loading project details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--heading-text)] mb-4">Project Not Found</h1>
            <p className="text-[var(--paragraph-text)] mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <Link href="/projects" className="inline-flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-6 rounded-full">
              View All Projects
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
                <Link href="/projects" className="text-[var(--accent-color)] hover:underline">
                  <i className="ri-arrow-left-line"></i> All Projects
                </Link>
                <span className="text-[var(--light-text)]">/</span>
                <span className="text-[var(--paragraph-text)] capitalize">{project.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--heading-text)] mb-2">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <div className="rounded-xl overflow-hidden border border-[var(--card-border)] h-[400px] relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                  <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-color)]" />
                </div>
              )}
              <img 
                src={imageSrc || project.image} 
                alt={project.title} 
                className="w-full h-full object-cover"
                style={{ opacity: imageLoading ? 0 : 1 }}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Project Overview</h2>
                <div className="space-y-4 text-[var(--paragraph-text)]">
                  <p>{project.description}</p>
                  <p>This project showcases my abilities in creating highly functional and visually appealing solutions. 
                     It involved deep thinking about user experience, performance optimization, and creating a maintainable codebase.</p>
                  <p>The development process included extensive planning, iterative design, and rigorous testing to ensure the final product met all requirements.</p>
                </div>
              </div>
              
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Key Features</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-[var(--paragraph-text)]">
                    <span className="text-[var(--accent-color)] mt-1"><i className="ri-checkbox-circle-line"></i></span>
                    <span>Responsive design that works seamlessly across all device sizes</span>
                  </li>
                  <li className="flex gap-3 text-[var(--paragraph-text)]">
                    <span className="text-[var(--accent-color)] mt-1"><i className="ri-checkbox-circle-line"></i></span>
                    <span>Intuitive user interface with smooth animations and transitions</span>
                  </li>
                  <li className="flex gap-3 text-[var(--paragraph-text)]">
                    <span className="text-[var(--accent-color)] mt-1"><i className="ri-checkbox-circle-line"></i></span>
                    <span>High performance optimization for fast loading and interaction</span>
                  </li>
                  <li className="flex gap-3 text-[var(--paragraph-text)]">
                    <span className="text-[var(--accent-color)] mt-1"><i className="ri-checkbox-circle-line"></i></span>
                    <span>Clean, maintainable code following best practices</span>
                  </li>
                  <li className="flex gap-3 text-[var(--paragraph-text)]">
                    <span className="text-[var(--accent-color)] mt-1"><i className="ri-checkbox-circle-line"></i></span>
                    <span>Comprehensive testing and quality assurance</span>
                  </li>
                </ul>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm uppercase text-[var(--light-text)] mb-1">Category</h3>
                    <p className="text-[var(--dark-text)] capitalize">{project.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase text-[var(--light-text)] mb-1">Client</h3>
                    <p className="text-[var(--dark-text)]">Corporate Client</p>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase text-[var(--light-text)] mb-1">Timeline</h3>
                    <p className="text-[var(--dark-text)]">6 Weeks</p>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase text-[var(--light-text)] mb-1">Role</h3>
                    <p className="text-[var(--dark-text)]">Lead Developer</p>
                  </div>
                </div>
              </div>
              
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="text-sm bg-[var(--background-gradient)]/20 text-[var(--dark-text)] px-3 py-1 rounded-full border border-[var(--card-border)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="glass-card border border-[var(--card-border)] rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--heading-text)] mb-4">View Project</h2>
                <div className="space-y-4">
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-6 rounded-full w-full justify-center"
                    >
                      Live Demo
                      <i className="ri-external-link-line"></i>
                    </a>
                  )}
                  <Link href="/projects" className="flex items-center gap-2 border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] text-[var(--dark-text)] font-medium py-3 px-6 rounded-full w-full justify-center">
                    More Projects
                  </Link>
                  <button 
                    onClick={handleContactClick}
                    className="flex items-center gap-2 bg-[var(--background-gradient)]/20 hover:bg-[var(--background-gradient)]/30 text-[var(--dark-text)] font-medium py-3 px-6 rounded-full w-full justify-center border border-[var(--card-border)] transition-all"
                  >
                    Get in Touch
                    <i className="ri-message-3-line"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}