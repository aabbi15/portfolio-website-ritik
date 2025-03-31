import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "./ui/theme-toggle";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

// Simple translation function to replace the useLanguage hook
const t = (key: string, fallback: string) => fallback;

export default function SimpleNavbar() {
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
  
  // Function to handle toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-[var(--bg-color)]/98 backdrop-blur-lg border-b border-[var(--card-border)] shadow-md' 
          : 'py-5 bg-[var(--bg-color)]/80 backdrop-blur-sm'
      }`} 
      id="navbar"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="text-xl font-bold flex items-center gap-2.5 cursor-pointer group">
              <div className="h-9 w-9 flex items-center justify-center bg-[var(--accent-color)] text-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                <i className="ri-code-s-slash-line text-xl"></i>
              </div>
              <span className="text-[var(--dark-text)] group-hover:text-[var(--accent-color)] transition-colors">{t('site.owner_name', 'Ritik Mahyavanshi')}</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Home Link */}
            <div className="relative px-3">
              {location === '/' ? (
                <button 
                  onClick={() => handleNavClick('home')}
                  className={`relative font-medium text-sm py-2 px-2 rounded-md transition-all ${
                    activeLink === 'home' 
                      ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50'
                  }`}
                >
                  {t('nav.home', 'Home')}
                  {activeLink === 'home' && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-[var(--accent-color)] rounded-full" />
                  )}
                </button>
              ) : (
                <Link href="/">
                  <div className="relative font-medium text-sm py-2 px-2 rounded-md transition-all cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50">
                    {t('nav.home', 'Home')}
                  </div>
                </Link>
              )}
            </div>
            
            {/* About Link */}
            <div className="relative px-1">
              {location === '/' ? (
                <button 
                  onClick={() => handleNavClick('about')}
                  className={`relative font-medium text-sm py-2 px-2 rounded-md transition-all ${
                    activeLink === 'about' 
                      ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50'
                  }`}
                >
                  {t('nav.about', 'About')}
                  {activeLink === 'about' && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-[var(--accent-color)] rounded-full" />
                  )}
                </button>
              ) : (
                <Link href="/#about">
                  <div className="relative font-medium text-sm py-2 px-2 rounded-md transition-all cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50">
                    {t('nav.about', 'About')}
                  </div>
                </Link>
              )}
            </div>
            
            {/* Experience Link */}
            <div className="relative px-1">
              {location === '/' ? (
                <button 
                  onClick={() => handleNavClick('experience')}
                  className={`relative font-medium text-sm py-2 px-2 rounded-md transition-all ${
                    activeLink === 'experience' 
                      ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50'
                  }`}
                >
                  {t('nav.experience', 'Experience')}
                  {activeLink === 'experience' && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-[var(--accent-color)] rounded-full" />
                  )}
                </button>
              ) : (
                <Link href="/experience">
                  <div className="relative font-medium text-sm py-2 px-2 rounded-md transition-all cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50">
                    {t('nav.experience', 'Experience')}
                  </div>
                </Link>
              )}
            </div>
            
            {/* Projects Link */}
            <div className="relative px-1">
              {location === '/' ? (
                <button 
                  onClick={() => handleNavClick('projects')}
                  className={`relative font-medium text-sm py-2 px-2 rounded-md transition-all ${
                    activeLink === 'projects' 
                      ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50'
                  }`}
                >
                  {t('nav.projects', 'Projects')}
                  {activeLink === 'projects' && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-[var(--accent-color)] rounded-full" />
                  )}
                </button>
              ) : (
                <Link href="/projects">
                  <div className="relative font-medium text-sm py-2 px-2 rounded-md transition-all cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50">
                    {t('nav.projects', 'Projects')}
                  </div>
                </Link>
              )}
            </div>
            
            {/* Blog Link */}
            <div className="relative px-1">
              <Link href="/blog">
                <div className="relative font-medium text-sm py-2 px-2 rounded-md transition-all cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50">
                  {t('nav.blog', 'Blog')}
                </div>
              </Link>
            </div>
            
            {/* Contact Link */}
            <div className="relative px-1">
              {location === '/' ? (
                <button 
                  onClick={() => handleNavClick('contact')}
                  className={`relative font-medium text-sm py-2 px-2 rounded-md transition-all ${
                    activeLink === 'contact' 
                      ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                      : 'text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50'
                  }`}
                >
                  {t('nav.contact', 'Contact')}
                  {activeLink === 'contact' && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-[var(--accent-color)] rounded-full" />
                  )}
                </button>
              ) : (
                <Link href="/#contact">
                  <div className="relative font-medium text-sm py-2 px-2 rounded-md transition-all cursor-pointer text-[var(--light-text)] hover:text-[var(--dark-text)] hover:bg-[var(--card-bg)]/50">
                    {t('nav.contact', 'Contact')}
                  </div>
                </Link>
              )}
            </div>
          </nav>
          
          {/* Right side elements */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Hire Me Button */}
            {location === '/' ? (
              <button 
                onClick={() => handleNavClick('contact')}
                className="hidden md:flex items-center bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-sm font-medium py-2.5 px-5 rounded-md shadow-sm hover:shadow transition-all"
              >
                <i className="ri-send-plane-line mr-2"></i>
                {t('nav.hire', 'Hire Me')}
              </button>
            ) : (
              <Link href="/#contact">
                <button className="hidden md:flex items-center bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white text-sm font-medium py-2.5 px-5 rounded-md shadow-sm hover:shadow transition-all">
                  <i className="ri-send-plane-line mr-2"></i>
                  {t('nav.hire', 'Hire Me')}
                </button>
              </Link>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMenu} 
              className="md:hidden flex items-center justify-center w-9 h-9 text-[var(--dark-text)] bg-[var(--card-bg)]/50 hover:bg-[var(--card-bg)] rounded-md focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              <i className={`ri-${isOpen ? 'close' : 'menu'}-line text-xl`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[var(--bg-color)]/98 backdrop-blur-lg border-b border-[var(--card-border)] shadow-lg overflow-hidden mobile-menu z-50 fixed w-full">
          <div className="container mx-auto px-6 py-5">
            <nav className="flex flex-col space-y-1">
              {/* Mobile Navigation Items */}
              {/* Home */}
              <div className="rounded-md overflow-hidden">
                {location === '/' ? (
                  <button 
                    onClick={() => {
                      handleNavClick('home');
                      setIsOpen(false);
                    }}
                    className={`py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md ${
                      activeLink === 'home' 
                        ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                        : 'text-[var(--light-text)] hover:bg-[var(--card-bg)]/70'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className="ri-home-4-line mr-3 text-base"></i>
                      {t('nav.home', 'Home')}
                    </div>
                  </button>
                ) : (
                  <Link href="/">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md text-[var(--light-text)] hover:bg-[var(--card-bg)]/70"
                    >
                      <div className="flex items-center">
                        <i className="ri-home-4-line mr-3 text-base"></i>
                        {t('nav.home', 'Home')}
                      </div>
                    </button>
                  </Link>
                )}
              </div>
              
              {/* About */}
              <div className="rounded-md overflow-hidden">
                {location === '/' ? (
                  <button 
                    onClick={() => {
                      handleNavClick('about');
                      setIsOpen(false);
                    }}
                    className={`py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md ${
                      activeLink === 'about' 
                        ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                        : 'text-[var(--light-text)] hover:bg-[var(--card-bg)]/70'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className="ri-user-3-line mr-3 text-base"></i>
                      {t('nav.about', 'About')}
                    </div>
                  </button>
                ) : (
                  <Link href="/#about">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md text-[var(--light-text)] hover:bg-[var(--card-bg)]/70"
                    >
                      <div className="flex items-center">
                        <i className="ri-user-3-line mr-3 text-base"></i>
                        {t('nav.about', 'About')}
                      </div>
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Experience */}
              <div className="rounded-md overflow-hidden">
                {location === '/' ? (
                  <button 
                    onClick={() => {
                      handleNavClick('experience');
                      setIsOpen(false);
                    }}
                    className={`py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md ${
                      activeLink === 'experience' 
                        ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                        : 'text-[var(--light-text)] hover:bg-[var(--card-bg)]/70'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className="ri-briefcase-4-line mr-3 text-base"></i>
                      {t('nav.experience', 'Experience')}
                    </div>
                  </button>
                ) : (
                  <Link href="/experience">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md text-[var(--light-text)] hover:bg-[var(--card-bg)]/70"
                    >
                      <div className="flex items-center">
                        <i className="ri-briefcase-4-line mr-3 text-base"></i>
                        {t('nav.experience', 'Experience')}
                      </div>
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Projects */}
              <div className="rounded-md overflow-hidden">
                {location === '/' ? (
                  <button 
                    onClick={() => {
                      handleNavClick('projects');
                      setIsOpen(false);
                    }}
                    className={`py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md ${
                      activeLink === 'projects' 
                        ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                        : 'text-[var(--light-text)] hover:bg-[var(--card-bg)]/70'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className="ri-folder-5-line mr-3 text-base"></i>
                      {t('nav.projects', 'Projects')}
                    </div>
                  </button>
                ) : (
                  <Link href="/projects">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md text-[var(--light-text)] hover:bg-[var(--card-bg)]/70"
                    >
                      <div className="flex items-center">
                        <i className="ri-folder-5-line mr-3 text-base"></i>
                        {t('nav.projects', 'Projects')}
                      </div>
                    </button>
                  </Link>
                )}
              </div>

              {/* Blog */}
              <div className="rounded-md overflow-hidden">
                <Link href="/blog">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md text-[var(--light-text)] hover:bg-[var(--card-bg)]/70"
                  >
                    <div className="flex items-center">
                      <i className="ri-article-line mr-3 text-base"></i>
                      {t('nav.blog', 'Blog')}
                    </div>
                  </button>
                </Link>
              </div>
              
              {/* Contact */}
              <div className="rounded-md overflow-hidden">
                {location === '/' ? (
                  <button 
                    onClick={() => {
                      handleNavClick('contact');
                      setIsOpen(false);
                    }}
                    className={`py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md ${
                      activeLink === 'contact' 
                        ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                        : 'text-[var(--light-text)] hover:bg-[var(--card-bg)]/70'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className="ri-mail-line mr-3 text-base"></i>
                      {t('nav.contact', 'Contact')}
                    </div>
                  </button>
                ) : (
                  <Link href="/#contact">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="py-3 px-4 text-left transition-all w-full font-medium text-sm rounded-md text-[var(--light-text)] hover:bg-[var(--card-bg)]/70"
                    >
                      <div className="flex items-center">
                        <i className="ri-mail-line mr-3 text-base"></i>
                        {t('nav.contact', 'Contact')}
                      </div>
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Mobile Hire Me Button */}
              <div className="pt-4">
                {location === '/' ? (
                  <button 
                    onClick={() => {
                      handleNavClick('contact');
                      setIsOpen(false);
                    }} 
                    className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-4 rounded-md shadow-sm hover:shadow text-center transition-all"
                  >
                    <div className="flex items-center justify-center">
                      <i className="ri-send-plane-line mr-2"></i>
                      {t('nav.hire', 'Hire Me')}
                    </div>
                  </button>
                ) : (
                  <Link href="/#contact">
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-4 rounded-md shadow-sm hover:shadow text-center transition-all"
                    >
                      <div className="flex items-center justify-center">
                        <i className="ri-send-plane-line mr-2"></i>
                        {t('nav.hire', 'Hire Me')}
                      </div>
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Settings */}
              <div className="mt-6 pt-5 border-t border-[var(--card-border)] flex flex-col">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[var(--light-text)] text-sm font-medium">{t('ui.theme', 'Toggle theme')}</span>
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}