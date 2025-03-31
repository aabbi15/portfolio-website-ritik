import React from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail as EnvelopeOpenIcon } from 'lucide-react';

// Newsletter form schema
const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().optional(),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterSection() {
  const { toast } = useToast();

  // Define form with validation
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  // Mutation for subscribing to newsletter
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: NewsletterFormValues) => {
      return await apiRequest('/api/newsletter/subscribe', {
        method: 'POST',
      }, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Thank you for subscribing to the newsletter.',
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: NewsletterFormValues) => {
    mutate(data);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 md:p-12 bg-primary/5 border shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-3/5">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-4 flex items-center gap-2"
              >
                <div className="bg-primary/10 p-2 rounded-full">
                  <EnvelopeOpenIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-primary">STAY UPDATED</h3>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold mb-4"
              >
                Subscribe to My Newsletter
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-muted-foreground mb-6"
              >
                Get the latest insights on backend development, AI, and tech trends delivered straight to your inbox. I send updates monthly—no spam, just valuable content.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-2 text-sm"
              >
                <div className="flex items-center">
                  <div className="size-2 rounded-full bg-primary mr-2"></div>
                  <span>Monthly newsletters</span>
                </div>
                <div className="flex items-center">
                  <div className="size-2 rounded-full bg-primary mr-2"></div>
                  <span>Coding tutorials</span>
                </div>
                <div className="flex items-center">
                  <div className="size-2 rounded-full bg-primary mr-2"></div>
                  <span>AI insights</span>
                </div>
                <div className="flex items-center">
                  <div className="size-2 rounded-full bg-primary mr-2"></div>
                  <span>Unsubscribe anytime</span>
                </div>
              </motion.div>
            </div>
            
            <div className="md:w-2/5 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card shadow-sm border rounded-lg p-6"
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Your name (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Your email address" required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isPending}
                    >
                      {isPending ? 'Subscribing...' : 'Subscribe Now'}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      By subscribing, you agree to receive email updates. Your email will not be shared with third parties.
                    </p>
                  </form>
                </Form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}