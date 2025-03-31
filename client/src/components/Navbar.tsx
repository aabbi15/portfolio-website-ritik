import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "./ui/theme-toggle";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

// Simple translation function to replace the useLanguage hook
const t = (key: string, fallback: string) => fallback;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const { scrollToElement } = useSmoothScroll();
  const [location] = useLocation();
  
  // Handle navbar background and scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Update active link based on scroll position - only on home page
      if (location === '/') {
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
          const sectionTop = (section as HTMLElement).offsetTop - 100;
          const sectionHeight = (section as HTMLElement).clientHeight;
          if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            setActiveLink(section.id);
          }
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // Simple function to handle home page section scrolling
  const handleNavClick = (id: string) => {
    if (location === '/') {
      scrollToElement(id);
    }
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-[var(--bg-color)]/95 backdrop-blur-lg border-b border-[var(--card-border)] shadow-sm' 
          : 'py-4 bg-transparent'
      }`} 
      id="navbar"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="text-xl font-medium flex items-center gap-2 cursor-pointer"
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="h-8 w-8 flex items-center justify-center">
                <i className="ri-code-s-slash-line text-2xl text-[var(--accent-color)]"></i>
              </div>
              <span className="text-[var(--dark-text)]">{t('site.owner_name', 'Ritik Mahyavanshi')}</span>
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex gap-10 items-center"
            variants={navContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Home Link */}
            <motion.div className="relative" variants={navItemVariants}>
              {location === '/' ? (
                <motion.button 
                  onClick={() => handleNavClick('home', 0)}
                  className={`relative font-normal text-sm transition-colors ${
                    activeLink === 'home' 
                      ? 'text-[var(--accent-color)]' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)]'
                  }`}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.1,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    y: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15 
                    } 
                  }}
                >
                  {t('nav.home', 'home')}
                  {activeLink === 'home' && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-color)]"
                      layoutId="navbar-underline"
                      style={{ width: '100%' }}
                    />
                  )}
                </motion.button>
              ) : (
                <Link href="/#home">
                  <motion.div 
                    className="relative font-normal text-sm transition-colors cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)]"
                    whileHover={{ 
                      y: -4, 
                      scale: 1.1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10 
                      } 
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      y: 0,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15 
                      } 
                    }}
                  >
                    {t('nav.home', 'home')}
                  </motion.div>
                </Link>
              )}
            </motion.div>
            
            {/* About Link */}
            <motion.div className="relative" variants={navItemVariants}>
              {location === '/' ? (
                <motion.button 
                  onClick={() => handleNavClick('about')}
                  className={`relative font-normal text-sm transition-colors ${
                    activeLink === 'about' 
                      ? 'text-[var(--accent-color)]' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)]'
                  }`}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.1,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    y: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15 
                    } 
                  }}
                >
                  {t('nav.about', 'about')}
                  {activeLink === 'about' && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-color)]"
                      layoutId="navbar-underline"
                      style={{ width: '100%' }}
                    />
                  )}
                </motion.button>
              ) : (
                <Link href="/#about">
                  <motion.div 
                    className="relative font-normal text-sm transition-colors cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)]"
                    whileHover={{ 
                      y: -4, 
                      scale: 1.1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10 
                      } 
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      y: 0,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15 
                      } 
                    }}
                  >
                    {t('nav.about', 'about')}
                  </motion.div>
                </Link>
              )}
            </motion.div>
            
            {/* Experience Link */}
            <motion.div className="relative" variants={navItemVariants}>
              {location === '/' ? (
                <motion.button 
                  onClick={() => handleNavClick('experience')}
                  className={`relative font-normal text-sm transition-colors ${
                    activeLink === 'experience' 
                      ? 'text-[var(--accent-color)]' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)]'
                  }`}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.1,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    y: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15 
                    } 
                  }}
                >
                  {t('nav.experience', 'experience')}
                  {activeLink === 'experience' && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-color)]"
                      layoutId="navbar-underline"
                      style={{ width: '100%' }}
                    />
                  )}
                </motion.button>
              ) : (
                <Link href="/experience">
                  <motion.div 
                    className="relative font-normal text-sm transition-colors cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)]"
                    whileHover={{ 
                      y: -4, 
                      scale: 1.1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10 
                      } 
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      y: 0,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15 
                      } 
                    }}
                  >
                    {t('nav.experience', 'experience')}
                  </motion.div>
                </Link>
              )}
            </motion.div>
            
            {/* Projects Link */}
            <motion.div className="relative" variants={navItemVariants}>
              {location === '/' ? (
                <motion.button 
                  onClick={() => handleNavClick('projects')}
                  className={`relative font-normal text-sm transition-colors ${
                    activeLink === 'projects' 
                      ? 'text-[var(--accent-color)]' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)]'
                  }`}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.1,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    y: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15 
                    } 
                  }}
                >
                  {t('nav.projects', 'projects')}
                  {activeLink === 'projects' && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-color)]"
                      layoutId="navbar-underline"
                      style={{ width: '100%' }}
                    />
                  )}
                </motion.button>
              ) : (
                <Link href="/projects">
                  <motion.div 
                    className="relative font-normal text-sm transition-colors cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)]"
                    whileHover={{ 
                      y: -4, 
                      scale: 1.1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10 
                      } 
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      y: 0,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15 
                      } 
                    }}
                  >
                    {t('nav.projects', 'projects')}
                  </motion.div>
                </Link>
              )}
            </motion.div>
            
            {/* Contact Link */}
            <motion.div className="relative" variants={navItemVariants}>
              {location === '/' ? (
                <motion.button 
                  onClick={() => handleNavClick('contact')}
                  className={`relative font-normal text-sm transition-colors ${
                    activeLink === 'contact' 
                      ? 'text-[var(--accent-color)]' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)]'
                  }`}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.1,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    y: 0,
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15 
                    } 
                  }}
                >
                  {t('nav.contact', 'contact')}
                  {activeLink === 'contact' && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-color)]"
                      layoutId="navbar-underline"
                      style={{ width: '100%' }}
                    />
                  )}
                </motion.button>
              ) : (
                <Link href="/#contact">
                  <motion.div 
                    className="relative font-normal text-sm transition-colors cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)]"
                    whileHover={{ 
                      y: -4, 
                      scale: 1.1,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 10 
                      } 
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      y: 0,
                      transition: { 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15 
                      } 
                    }}
                  >
                    {t('nav.contact', 'contact')}
                  </motion.div>
                </Link>
              )}
            </motion.div>
          </motion.nav>
          
          {/* Right side elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            
            {/* Hire Me Button */}
            {location === '/' ? (
              <motion.button 
                onClick={() => scrollToElement('contact')}
                className="hidden md:flex items-center bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-sm font-medium py-2 px-4 rounded-full transition-all"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" 
                }}
                whileTap={{ scale: 0.95 }}
              >
                {t('nav.hire', 'Hire Me')}
              </motion.button>
            ) : (
              <motion.button 
                onClick={() => navigate('/#contact')}
                className="hidden md:flex items-center bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-sm font-medium py-2 px-4 rounded-full transition-all"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" 
                }}
                whileTap={{ scale: 0.95 }}
              >
                {t('nav.hire', 'Hire Me')}
              </motion.button>
            )}
            
            {/* Mobile Menu Toggle */}
            <motion.button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-[var(--dark-text)] focus:outline-none"
              aria-label="Toggle Menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.i 
                  key={isOpen ? 'close' : 'menu'}
                  className={`ri-${isOpen ? 'close' : 'menu'}-line text-xl`}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto',
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }
            }}
            exit={{ 
              opacity: 0, 
              height: 0,
              transition: {
                height: { delay: 0.1 },
                opacity: { duration: 0.2 }
              }
            }}
            className="md:hidden bg-[var(--bg-color)] border-b border-[var(--card-border)] shadow-sm overflow-hidden mobile-menu z-50 fixed w-full"
          >
            <motion.div 
              className="container mx-auto px-6 py-6"
              variants={navContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <nav className="flex flex-col space-y-2">
                {/* Mobile Navigation Items */}
                {/* Home */}
                <motion.div variants={navItemVariants}>
                  {location === '/' ? (
                    <motion.button 
                      onClick={() => {
                        scrollToElement('home', { offset: 0 });
                        setIsOpen(false);
                      }}
                      className={`py-3 text-left transition-colors ${
                        activeLink === 'home' 
                          ? 'text-[var(--accent-color)]' 
                          : 'text-[var(--light-text)]'
                      }`}
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.home', 'home')}
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => {
                        navigate("/#home");
                        setIsOpen(false);
                      }}
                      className="py-3 text-left transition-colors text-[var(--light-text)]"
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.home', 'home')}
                    </motion.button>
                  )}
                </motion.div>
                
                {/* About */}
                <motion.div variants={navItemVariants}>
                  {location === '/' ? (
                    <motion.button 
                      onClick={() => {
                        scrollToElement('about');
                        setIsOpen(false);
                      }}
                      className={`py-3 text-left transition-colors ${
                        activeLink === 'about' 
                          ? 'text-[var(--accent-color)]' 
                          : 'text-[var(--light-text)]'
                      }`}
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.about', 'about')}
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => {
                        navigate("/#about");
                        setIsOpen(false);
                      }}
                      className="py-3 text-left transition-colors text-[var(--light-text)]"
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.about', 'about')}
                    </motion.button>
                  )}
                </motion.div>
                
                {/* Experience */}
                <motion.div variants={navItemVariants}>
                  {location === '/' ? (
                    <motion.button 
                      onClick={() => {
                        scrollToElement('experience');
                        setIsOpen(false);
                      }}
                      className={`py-3 text-left transition-colors ${
                        activeLink === 'experience' 
                          ? 'text-[var(--accent-color)]' 
                          : 'text-[var(--light-text)]'
                      }`}
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.experience', 'experience')}
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => {
                        navigate("/experience");
                        setIsOpen(false);
                      }}
                      className="py-3 text-left transition-colors text-[var(--light-text)]"
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.experience', 'experience')}
                    </motion.button>
                  )}
                </motion.div>
                
                {/* Projects */}
                <motion.div variants={navItemVariants}>
                  {location === '/' ? (
                    <motion.button 
                      onClick={() => {
                        scrollToElement('projects');
                        setIsOpen(false);
                      }}
                      className={`py-3 text-left transition-colors ${
                        activeLink === 'projects' 
                          ? 'text-[var(--accent-color)]' 
                          : 'text-[var(--light-text)]'
                      }`}
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.projects', 'projects')}
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => {
                        navigate("/projects");
                        setIsOpen(false);
                      }}
                      className="py-3 text-left transition-colors text-[var(--light-text)]"
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.projects', 'projects')}
                    </motion.button>
                  )}
                </motion.div>
                
                {/* Contact */}
                <motion.div variants={navItemVariants}>
                  {location === '/' ? (
                    <motion.button 
                      onClick={() => {
                        scrollToElement('contact');
                        setIsOpen(false);
                      }}
                      className={`py-3 text-left transition-colors ${
                        activeLink === 'contact' 
                          ? 'text-[var(--accent-color)]' 
                          : 'text-[var(--light-text)]'
                      }`}
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.contact', 'contact')}
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => {
                        navigate("/#contact");
                        setIsOpen(false);
                      }}
                      className="py-3 text-left transition-colors text-[var(--light-text)]"
                      whileHover={{
                        x: 8,
                        color: 'var(--accent-color)',
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }
                      }}
                      whileTap={{
                        x: 15,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 10
                        }
                      }}
                    >
                      {t('nav.contact', 'contact')}
                    </motion.button>
                  )}
                </motion.div>
                
                {/* Mobile Hire Me Button */}
                <motion.div variants={navItemVariants} className="pt-2">
                  {location === '/' ? (
                    <motion.button 
                      onClick={() => {
                        scrollToElement('contact');
                        setIsOpen(false);
                      }} 
                      className="w-full bg-[var(--accent-color)] text-white font-medium py-3 px-4 rounded-full text-center"
                      whileHover={{ 
                        scale: 1.03,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }
                      }}
                      whileTap={{ 
                        scale: 0.97,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }
                      }}
                    >
                      {t('nav.hire', 'Hire Me')}
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => {
                        navigate("/#contact");
                        setIsOpen(false);
                      }} 
                      className="w-full bg-[var(--accent-color)] text-white font-medium py-3 px-4 rounded-full text-center"
                      whileHover={{ 
                        scale: 1.03,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }
                      }}
                      whileTap={{ 
                        scale: 0.97,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }
                      }}
                    >
                      {t('nav.hire', 'Hire Me')}
                    </motion.button>
                  )}
                </motion.div>
                
                {/* Settings */}
                <motion.div 
                  className="mt-6 pt-6 border-t border-[var(--card-border)] flex flex-col space-y-4"
                  variants={navItemVariants}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--light-text)] text-sm">{t('ui.theme', 'Toggle theme')}</span>
                    <ThemeToggle />
                  </div>
                </motion.div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}