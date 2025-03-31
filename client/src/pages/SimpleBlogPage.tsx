import { useState, lazy, Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import SimpleNavbar from "@/components/SimpleNavbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaTag, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { PageLoading } from "@/components/ui/page-loading";
import SEOHead from "@/components/ui/seo-head";

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

export default function SimpleBlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
        {
          id: 4,
          title: 'Modern CSS Techniques for Responsive Designs',
          slug: 'modern-css-techniques-for-responsive-designs',
          summary: 'Explore advanced CSS techniques like Grid, Flexbox, and custom properties for building responsive web designs.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'frontend',
          tags: ['css', 'responsive', 'web design', 'flexbox'],
          isPublished: true,
          viewCount: 1050,
          publishedAt: '2024-01-25T12:00:00Z',
          updatedAt: '2024-01-25T12:00:00Z',
        },
        {
          id: 5,
          title: 'Building Real-time Applications with WebSockets',
          slug: 'building-real-time-applications-with-websockets',
          summary: 'A practical guide to implementing real-time features in your web applications using WebSockets.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvZGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'backend',
          tags: ['websockets', 'real-time', 'javascript', 'nodejs'],
          isPublished: true,
          viewCount: 750,
          publishedAt: '2024-03-01T12:00:00Z',
          updatedAt: '2024-03-01T12:00:00Z',
        },
        {
          id: 6,
          title: 'React Performance Optimization Techniques',
          slug: 'react-performance-optimization-techniques',
          summary: 'Learn how to optimize your React applications for better performance and user experience.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHJlYWN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'frontend',
          tags: ['react', 'performance', 'optimization', 'javascript'],
          isPublished: true,
          viewCount: 925,
          publishedAt: '2024-02-20T12:00:00Z',
          updatedAt: '2024-02-20T12:00:00Z',
        },
      ] as BlogPost[];
    },
  });

  // Get unique categories for tabs
  const categories = posts 
    ? ['all', ...Array.from(new Set(posts.map(post => post.category)))]
    : ['all'];

  // Filter posts by category and search query
  const filteredPosts = useMemo(() => 
    posts 
      ? (posts
          .filter(post => activeCategory === 'all' || post.category === activeCategory)
          .filter(post => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
              post.title.toLowerCase().includes(query) || 
              post.summary.toLowerCase().includes(query) || 
              post.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }))
      : [],
    [posts, activeCategory, searchQuery]
  );
  
  // Prefetch blog post details when hovering over links
  const handlePostHover = (slug: string) => {
    // Prefetch the post data when hovering over a post card
    queryClient.prefetchQuery({
      queryKey: ['/api/blog-posts', slug],
      queryFn: async () => {
        console.log(`Prefetching post: ${slug}`);
        return posts?.find(p => p.slug === slug);
      }
    });
  };

  // Create structured data for a blog listing page
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "headline": "Technical Blog by Ritik Mahyavanshi",
      "description": "Insights, tutorials, and thoughts on tech, development, and artificial intelligence.",
      "url": "https://ritikmahyavanshi.com/blog",
      "author": {
        "@type": "Person",
        "name": "Ritik Mahyavanshi"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ritik Mahyavanshi",
        "logo": {
          "@type": "ImageObject",
          "url": "https://images.unsplash.com/photo-1633332755192-727a05c4013d"
        }
      },
      "inLanguage": "en-US"
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)]">
      {/* SEO optimization */}
      <SEOHead 
        title="Technical Blog | Web Development, AI & Machine Learning | Ritik Mahyavanshi"
        description="Explore practical tutorials, in-depth articles, and industry insights on web development, AI, and modern software engineering practices."
        keywords="web development, AI, machine learning, JavaScript, React, Node.js, technical blog, programming tutorials"
        canonical="https://ritikmahyavanshi.com/blog"
        structuredData={structuredData}
      />
      <SimpleNavbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-[var(--dark-text)]">Blog & Articles</h1>
            <p className="text-[var(--light-text)] max-w-2xl mx-auto">
              Insights, tutorials, and thoughts on tech, development, and artificial intelligence.
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="relative w-full md:w-auto md:flex-grow md:max-w-md">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[var(--card-bg)] border-[var(--card-border)]"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--light-text)]" />
            </div>
            
            <div className="text-sm text-[var(--light-text)]">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            </div>
          </div>

          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-8">
              <TabsTrigger value="all" className="text-sm">All Posts</TabsTrigger>
              {categories.filter(cat => cat !== 'all').map(category => (
                <TabsTrigger key={category} value={category} className="text-sm capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((_, i) => (
                    <div key={i} className="bg-[var(--card-bg)] rounded-xl h-96"></div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium text-[var(--dark-text)] mb-2">No articles found</h3>
                  <p className="text-[var(--light-text)]">
                    {searchQuery ? 
                      `No articles matching "${searchQuery}" were found. Try a different search term.` : 
                      `No articles found in this category. Check back later for more content.`}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <Suspense fallback={
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((_, i) => (
                      <div key={i} className="bg-[var(--card-bg)] rounded-xl h-96"></div>
                    ))}
                  </div>
                }>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <Card key={post.id} className="overflow-hidden border-[var(--card-border)] bg-[var(--card-bg)] hover:shadow-md transition-shadow duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 opacity-80"
                            loading="lazy"
                            onLoad={(e) => {
                              (e.target as HTMLImageElement).classList.add('opacity-100');
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 text-xs font-medium bg-primary/90 text-white rounded-md capitalize">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        
                        <CardHeader className="pb-2">
                          <div className="flex items-center text-xs text-[var(--light-text)] mb-2">
                            <FaCalendarAlt className="mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </div>
                          <Link 
                            href={`/blog/${post.slug}`}
                            onMouseEnter={() => handlePostHover(post.slug)}
                          >
                            <h3 className="text-xl font-semibold leading-tight text-[var(--dark-text)] hover:text-primary transition-colors cursor-pointer">
                              {post.title}
                            </h3>
                          </Link>
                        </CardHeader>
                        
                        <CardContent className="pb-4 flex-grow">
                          <p className="text-sm text-[var(--light-text)] line-clamp-3">
                            {post.summary}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="inline-flex items-center text-xs text-[var(--light-text)] bg-[var(--card-bg-hover)] px-2 py-1 rounded-full">
                                <FaTag size={10} className="mr-1" />
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="inline-flex items-center text-xs text-[var(--light-text)] bg-[var(--card-bg-hover)] px-2 py-1 rounded-full">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-0">
                          <Link 
                            href={`/blog/${post.slug}`}
                            onMouseEnter={() => handlePostHover(post.slug)}
                          >
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:bg-primary/10 transition-colors"
                            >
                              Read More →
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </Suspense>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}