import { motion } from "framer-motion";
import { useState } from "react";
import { testimonials } from "@/data/testimonials";

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handlePrevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 relative bg-[var(--section-bg)]">
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,white)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <p className="text-primary font-medium text-sm">Testimonials</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-5">
            <span className="gradient-text">Client Feedback</span>
          </h2>
          <p className="text-[var(--light-text)] text-lg max-w-3xl mx-auto">
            Here's what some clients have to say about working with me on their projects.
          </p>
        </motion.div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-color)]/5 to-blue-500/5 rounded-3xl transform scale-105 blur-xl -z-10"></div>
          
          <motion.div 
            className="relative overflow-hidden glass-card p-8 md:p-12 rounded-3xl shadow-xl border border-[var(--card-border)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="md:w-1/3 flex-shrink-0">
                <motion.div 
                  className="relative mx-auto max-w-[200px]"
                  key={activeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-color)]/20 to-blue-500/20 rounded-full transform scale-105 blur-xl"></div>
                  <div className="relative overflow-hidden rounded-full border-4 border-[var(--card-bg)] shadow-xl aspect-square">
                    <img
                      src={testimonials[activeIndex].image}
                      alt={testimonials[activeIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[var(--accent-color)] text-white px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    <p className="text-sm font-medium">{testimonials[activeIndex].company}</p>
                  </div>
                </motion.div>
              </div>
              
              <div className="md:w-2/3">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center md:text-left"
                >
                  <i className="ri-double-quotes-l text-[var(--accent-color)]/30 text-6xl absolute -top-2 left-0 opacity-50"></i>
                  <p className="text-[var(--paragraph-text)] text-lg md:text-xl mb-6 relative z-10 leading-relaxed">
                    "{testimonials[activeIndex].text}"
                  </p>
                  <h4 className="text-[var(--heading-text)] font-bold text-xl">{testimonials[activeIndex].name}</h4>
                  <p className="text-[var(--light-text)]">{testimonials[activeIndex].position}</p>
                </motion.div>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-end gap-4 mt-8">
              <button 
                onClick={handlePrevTestimonial}
                className="w-12 h-12 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--light-text)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors"
                aria-label="Previous testimonial"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <button 
                onClick={handleNextTestimonial}
                className="w-12 h-12 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--light-text)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors"
                aria-label="Next testimonial"
              >
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            </div>
          </motion.div>
          
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === activeIndex 
                    ? "bg-[var(--accent-color)] w-8" 
                    : "bg-[var(--light-text)]/30 hover:bg-[var(--light-text)]/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .bg-grid-pattern {
            background-size: 50px 50px;
            background-image: 
              linear-gradient(to right, var(--heading-text) 1px, transparent 1px),
              linear-gradient(to bottom, var(--heading-text) 1px, transparent 1px);
          }
        `
      }} />
    </section>
  );
}