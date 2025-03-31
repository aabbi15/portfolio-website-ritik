import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';

// Blog post type definition
type BlogPost = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  authorId: number;
  category: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  publishedAt: string;
  updatedAt: string;
};

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Fetch blog posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog-posts'],
    queryFn: async () => {
      // For now, return mock data since we haven't implemented the API endpoint yet
      return [
        {
          id: 1,
          title: 'Building Scalable APIs with Node.js and Express',
          slug: 'building-scalable-apis-with-nodejs-and-express',
          summary: 'Learn how to architect and implement high-performance RESTful APIs using Node.js and Express.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVjaCUyMGFydGljbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'backend',
          tags: ['nodejs', 'express', 'api', 'rest'],
          isPublished: true,
          viewCount: 1250,
          publishedAt: '2023-12-15T12:00:00Z',
          updatedAt: '2023-12-15T12:00:00Z',
        },
        {
          id: 2,
          title: 'Introduction to Machine Learning with TensorFlow',
          slug: 'introduction-to-machine-learning-with-tensorflow',
          summary: 'A comprehensive guide to getting started with machine learning using TensorFlow 2.0.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'ai-ml',
          tags: ['tensorflow', 'machine learning', 'ai', 'deep learning'],
          isPublished: true,
          viewCount: 875,
          publishedAt: '2024-01-05T12:00:00Z',
          updatedAt: '2024-01-05T12:00:00Z',
        },
        {
          id: 3,
          title: 'Setting Up CI/CD Pipelines with GitHub Actions',
          slug: 'setting-up-cicd-pipelines-with-github-actions',
          summary: 'Learn how to implement continuous integration and deployment using GitHub Actions.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHRlY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'devops',
          tags: ['github', 'ci/cd', 'devops', 'automation'],
          isPublished: true,
          viewCount: 650,
          publishedAt: '2024-02-10T12:00:00Z',
          updatedAt: '2024-02-10T12:00:00Z',
        },
      ] as BlogPost[];
    },
  });

  // Get unique categories for tabs
  const categories = posts 
    ? ['all', ...Array.from(new Set(posts.map(post => post.category)))]
    : ['all'];

  // Filter posts by category
  const filteredPosts = posts 
    ? (activeCategory === 'all' 
        ? posts 
        : posts.filter(post => post.category === activeCategory))
    : [];

  return (
    <section id="blog" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">Blog & Articles</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and thoughts on tech, development, and artificial intelligence.
          </p>
        </motion.div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-8">
            <TabsTrigger value="all" className="text-sm">All Posts</TabsTrigger>
            {categories.filter(cat => cat !== 'all').map(category => (
              <TabsTrigger key={category} value={category} className="text-sm capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {isLoading ? (
                // Skeleton loader
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden h-[450px]">
                    <Skeleton className="h-48 w-full rounded-none" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-8 w-1/3" />
                    </CardFooter>
                  </Card>
                ))
              ) : (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: post.id * 0.1 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <Badge className="w-fit capitalize mb-2" variant="secondary">{post.category}</Badge>
                        <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt size={12} />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.summary}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              <FaTag size={10} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10 transition-colors">
                          <Link href={`/blog/${post.slug}`}>Read More</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
            
            {!isLoading && filteredPosts.length >= 3 && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" className="font-medium">
                  <Link href="/blog">View All Articles</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}