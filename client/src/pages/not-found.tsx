import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h1 className="text-8xl md:text-9xl font-bold gradient-text">404</h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-text)] mb-4">
              Page Not Found
            </h2>
            
            <p className="text-[var(--paragraph-text)] mb-8 mx-auto max-w-lg">
              Oops! The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <a className="inline-flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white font-medium py-3 px-6 rounded-full">
                  Back to Home
                  <i className="ri-home-line"></i>
                </a>
              </Link>
              
              <Link href="/#contact">
                <a className="inline-flex items-center justify-center gap-2 border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] text-[var(--dark-text)] font-medium py-3 px-6 rounded-full">
                  Contact Me
                  <i className="ri-mail-line"></i>
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}