import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

type CategoryFilter = "all" | "web" | "ui" | "mobile" | "ai-ml" | "backend" | "fullstack";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [imageSources, setImageSources] = useState<Record<number, string>>({});
  
  // Fetch projects from API
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter projects by category
  const filteredProjects = projects && (
    activeCategory === "all" 
      ? projects 
      : projects.filter(project => project.category === activeCategory)
  );
  
  // Enhanced categories list
  const categories: {id: CategoryFilter, label: string}[] = [
    { id: "all", label: "All Projects" },
    { id: "web", label: "Web Development" },
    { id: "backend", label: "Backend Systems" },
    { id: "fullstack", label: "Full Stack" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "ai-ml", label: "AI & Machine Learning" },
    { id: "ui", label: "UI/UX Design" },
  ];

  // Handle image loading
  const handleImageLoad = (projectId: number) => {
    setImageLoading(prev => ({ ...prev, [projectId]: false }));
  };

  const handleImageError = (projectId: number) => {
    console.error(`Failed to load image for project ${projectId}`);
    setImageLoading(prev => ({ ...prev, [projectId]: false }));
  };
  
  // Preload images when projects data changes
  useEffect(() => {
    if (!projects) return;
    
    const newImageSources: Record<number, string> = {};
    
    projects.forEach(project => {
      // Set loading state
      setImageLoading(prev => ({ ...prev, [project.id]: true }));
      
      // Add cache busting for server images
      const imgSrc = project.image.startsWith('/uploads/') 
        ? `${project.image}?t=${Date.now()}` 
        : project.image;
      
      // Store image source
      newImageSources[project.id] = imgSrc;
      
      // Preload image
      const img = new Image();
      img.onload = () => handleImageLoad(project.id);
      img.onerror = () => handleImageError(project.id);
      img.src = imgSrc;
    });
    
    setImageSources(newImageSources);
  }, [projects]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
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
                Projects Portfolio
              </h1>
              <p className="text-[var(--paragraph-text)] text-lg">
                Explore my collection of projects spanning various domains and technologies
              </p>
            </div>
            
            <Link href="/#projects" className="inline-flex items-center gap-1 text-[var(--accent-color)] font-medium hover:underline">
              <i className="ri-arrow-left-line"></i>
              Back to Home
            </Link>
          </motion.div>
          
          <div className="mb-10 overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    activeCategory === category.id
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--card-bg)] text-[var(--paragraph-text)] hover:bg-[var(--card-bg-hover)]'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-color)]" />
            </div>
          ) : error ? (
            <div className="text-center py-12 border rounded-lg bg-card">
              <h3 className="text-lg font-medium text-[var(--heading-text)]">Failed to load projects</h3>
              <p className="text-[var(--paragraph-text)] mt-2">
                There was an error loading the projects. Please try again later.
              </p>
            </div>
          ) : !filteredProjects || filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-[var(--heading-text)] mb-2">No projects found</h3>
              <p className="text-[var(--paragraph-text)] mb-6">
                {activeCategory === "all" 
                  ? "No projects have been added yet." 
                  : "There are no projects in this category yet."}
              </p>
              {activeCategory !== "all" && (
                <button
                  onClick={() => setActiveCategory("all")}
                  className="px-4 py-2 rounded-full font-medium text-sm bg-[var(--accent-color)] text-white"
                >
                  View All Projects
                </button>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="glass-card border border-[var(--card-border)] rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                  layout
                >
                  <div className="relative h-48 overflow-hidden">
                    {imageLoading[project.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-color)]" />
                      </div>
                    )}
                    <img 
                      src={imageSources[project.id] || project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      style={{ opacity: imageLoading[project.id] ? 0 : 1 }}
                      onLoad={() => handleImageLoad(project.id)}
                      onError={() => handleImageError(project.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex} 
                            className="text-xs bg-white/20 text-white backdrop-blur-sm px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs bg-white/20 text-white backdrop-blur-sm px-2 py-1 rounded-full">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[var(--heading-text)] mb-2">{project.title}</h2>
                    <p className="text-[var(--paragraph-text)] mb-4 line-clamp-2 overflow-hidden">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 5).map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          +{project.technologies.length - 5}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-[var(--accent-color)] hover:underline inline-flex items-center gap-1">
                        View details
                        <i className="ri-arrow-right-line"></i>
                      </Link>
                      
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[var(--paragraph-text)] hover:text-[var(--dark-text)] inline-flex items-center gap-1"
                        >
                          <i className="ri-external-link-line"></i>
                          Live demo
                        </a>
                      )}
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