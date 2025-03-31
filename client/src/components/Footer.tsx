import { motion } from "framer-motion";
import SocialProfiles from "./SocialProfiles";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
      <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <a href="#home" className="text-2xl font-heading font-bold flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white shadow-lg">
                <span className="font-bold">RM</span>
              </div>
              <span className="gradient-text">Ritik Mahyavanshi</span>
            </a>
            <p className="text-gray-300 mb-6 leading-relaxed">
              I craft exceptional digital experiences through creative development and user-centered design.
            </p>
            
            <div className="flex gap-4">
              {/* Dynamic Social Media Profiles */}
              <SocialProfiles 
                className="flex flex-wrap gap-3" 
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:mx-auto"
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#home" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  Projects
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:mx-auto"
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Services
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  Web Development
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  UI/UX Design
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  Mobile App Development
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors hover:translate-x-1 duration-300 group"
                >
                  <i className="ri-arrow-right-s-line text-primary group-hover:translate-x-1 transition-transform"></i>
                  Consulting
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              Contact Info
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <i className="ri-mail-line text-primary mt-1"></i>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href="mailto:hello@ritikmahyavanshi.com" className="text-gray-300 hover:text-white transition-colors">
                    hello@ritikmahyavanshi.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-phone-line text-primary mt-1"></i>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <a href="tel:+11234567890" className="text-gray-300 hover:text-white transition-colors">
                    +1 (123) 456-7890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-map-pin-line text-primary mt-1"></i>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <span className="text-gray-300">
                    San Francisco, CA
                  </span>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-700/50 pt-8 flex flex-col sm:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">
            &copy; {currentYear} <span className="text-primary">Ritik Mahyavanshi</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
