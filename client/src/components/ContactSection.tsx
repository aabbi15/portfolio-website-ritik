import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertContactSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ContactFormSchema = insertContactSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  const [formStatus, setFormStatus] = useState<{ success?: string; error?: string } | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return await apiRequest<any, ContactFormValues>("/api/contact", { method: "POST" }, data);
    },
    onSuccess: () => {
      setFormStatus({ success: "Your message has been sent successfully!" });
      reset();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus(null);
      }, 5000);
    },
    onError: (error) => {
      setFormStatus({ error: error instanceof Error ? error.message : "Failed to send message. Please try again." });
    }
  });
  
  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };
  
  return (
    <section id="contact" className="py-24 md:py-32 relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <p className="text-primary font-medium text-sm">Get In Touch</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4">
            <span className="gradient-text">Let's Chat</span>
          </h2>
          <p className="text-[var(--paragraph-text)] max-w-xl mx-auto">
            Have a project in mind or want to discuss a potential collaboration? Drop me a message and I'll get back to you as soon as possible.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="glass-morph p-8 lg:p-10 rounded-2xl h-full">
              <h3 className="text-2xl font-heading font-bold text-[var(--heading-text)] mb-8 section-title inline-block pb-3">
                Contact Information
              </h3>
              
              <div className="space-y-8 mt-8">
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <i className="ri-mail-line text-primary text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[var(--paragraph-text)] mb-1">Email Address</h4>
                    <a 
                      href="mailto:hello@janedoe.com" 
                      className="text-[var(--paragraph-text)] hover:text-primary transition-colors hover:underline"
                    >
                      hello@janedoe.com
                    </a>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <i className="ri-phone-line text-primary text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[var(--paragraph-text)] mb-1">Phone Number</h4>
                    <a 
                      href="tel:+11234567890" 
                      className="text-[var(--paragraph-text)] hover:text-primary transition-colors hover:underline"
                    >
                      +1 (123) 456-7890
                    </a>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <i className="ri-map-pin-line text-primary text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[var(--paragraph-text)] mb-1">Location</h4>
                    <p className="text-[var(--paragraph-text)]">
                      San Francisco, CA
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <h4 className="text-base font-medium text-[var(--paragraph-text)] mb-5">Connect on Social Media</h4>
                <div className="flex gap-4">
                  <a 
                    href="#" 
                    aria-label="GitHub" 
                    className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-[var(--paragraph-text)] hover:text-primary hover:shadow-md transition-all"
                  >
                    <i className="ri-github-fill text-lg"></i>
                  </a>
                  <a 
                    href="#" 
                    aria-label="LinkedIn" 
                    className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-[var(--paragraph-text)] hover:text-primary hover:shadow-md transition-all"
                  >
                    <i className="ri-linkedin-fill text-lg"></i>
                  </a>
                  <a 
                    href="#" 
                    aria-label="Twitter" 
                    className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-[var(--paragraph-text)] hover:text-primary hover:shadow-md transition-all"
                  >
                    <i className="ri-twitter-fill text-lg"></i>
                  </a>
                  <a 
                    href="#" 
                    aria-label="Instagram" 
                    className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-[var(--paragraph-text)] hover:text-primary hover:shadow-md transition-all"
                  >
                    <i className="ri-instagram-line text-lg"></i>
                  </a>
                </div>
              </motion.div>
              
              {/* Schedule call banner */}
              <motion.div 
                className="mt-12 bg-gradient-to-r from-primary to-blue-500 rounded-xl p-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <h4 className="text-lg font-medium mb-2">Need a quick chat?</h4>
                <p className="mb-4 text-white/90 text-sm">Schedule a 30-minute discovery call to discuss your project in detail.</p>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 bg-white text-primary font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
                >
                  <i className="ri-calendar-line"></i>
                  <span>Schedule a Call</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="glass-card p-8 lg:p-10 rounded-2xl shadow-lg"
            >
              <h3 className="text-2xl font-heading font-bold text-[var(--heading-text)] mb-8">
                Send Me a Message
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--paragraph-text)] mb-2">Your Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="ri-user-line text-[var(--paragraph-text)]/60"></i>
                    </div>
                    <input 
                      type="text" 
                      id="name" 
                      placeholder="Ritik Mahyavanshi" 
                      className={`w-full py-3 pl-10 pr-4 bg-[var(--card-bg)]/60 border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--paragraph-text)] mb-2">Your Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="ri-mail-line text-[var(--paragraph-text)]/60"></i>
                    </div>
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="ritik@example.com" 
                      className={`w-full py-3 pl-10 pr-4 bg-[var(--card-bg)]/60 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-[var(--paragraph-text)] mb-2">Subject</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-chat-1-line text-[var(--paragraph-text)]/60"></i>
                  </div>
                  <input 
                    type="text" 
                    id="subject" 
                    placeholder="Project Inquiry" 
                    className={`w-full py-3 pl-10 pr-4 bg-[var(--card-bg)]/60 border ${errors.subject ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                    {...register("subject")}
                  />
                </div>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                )}
              </div>
              
              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-medium text-[var(--paragraph-text)] mb-2">Message</label>
                <div className="relative">
                  <textarea 
                    id="message" 
                    rows={5} 
                    placeholder="Hello Ritik, I'm interested in discussing a project with you..." 
                    className={`w-full p-4 bg-[var(--card-bg)]/60 border ${errors.message ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all`}
                    {...register("message")}
                  ></textarea>
                </div>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={contactMutation.isPending}
                className="w-full from-primary to-blue-500 bg-gradient-to-r text-white font-medium py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              >
                {contactMutation.isPending ? (
                  <>Sending... <i className="ri-loader-4-line animate-spin ml-2"></i></>
                ) : (
                  <>Send Message <i className="ri-send-plane-fill ml-2"></i></>
                )}
              </button>
              
              {formStatus && (
                <div className={`mt-4 p-3 rounded-lg ${
                  formStatus.success 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <p className="flex items-center">
                    {formStatus.success ? (
                      <><i className="ri-check-line mr-2"></i>{formStatus.success}</>
                    ) : (
                      <><i className="ri-error-warning-line mr-2"></i>{formStatus.error}</>
                    )}
                  </p>
                </div>
              )}
              
              <p className="text-[var(--paragraph-text)]/70 text-sm mt-5 text-center">
                I respect your privacy and will never share your information with third parties.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
