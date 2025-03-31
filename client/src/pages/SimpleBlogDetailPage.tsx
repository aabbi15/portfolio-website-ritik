import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link, useRoute } from "wouter";
import SEOHead from "@/components/ui/seo-head";
import SimpleNavbar from "@/components/SimpleNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaCalendarAlt, FaTag, FaArrowLeft, FaUser } from "react-icons/fa";

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

export default function SimpleBlogDetailPage() {
  const [match, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug;

  // Fetch all blog posts
  const { data: allPosts, isLoading } = useQuery({
    queryKey: ['/api/blog-posts'],
    queryFn: async () => {
      // For now, return mock data
      return [
        {
          id: 1,
          title: 'Building Scalable APIs with Node.js and Express',
          slug: 'building-scalable-apis-with-nodejs-and-express',
          summary: 'Learn how to architect and implement high-performance RESTful APIs using Node.js and Express.',
          content: `
          <p>Building scalable APIs is a crucial skill in today's web development landscape. In this article, we'll dive deep into creating robust, maintainable, and high-performance APIs using Node.js and Express.</p>
          
          <h2>Why Node.js and Express?</h2>
          <p>Node.js provides an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices. Express, on the other hand, is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.</p>
          
          <h2>Setting Up the Project</h2>
          <p>First, let's initialize a new Node.js project and install Express:</p>
          <pre><code>
            mkdir my-api
            cd my-api
            npm init -y
            npm install express
          </code></pre>
          
          <h2>Basic Server Setup</h2>
          <p>Create an index.js file and set up a basic Express server:</p>
          <pre><code>
            const express = require('express');
            const app = express();
            const PORT = process.env.PORT || 3000;
            
            app.use(express.json());
            
            app.get('/', (req, res) => {
              res.send('API is running');
            });
            
            app.listen(PORT, () => {
              console.log(\`Server running on port \${PORT}\`);
            });
          </code></pre>
          
          <h2>Conclusion</h2>
          <p>Building scalable APIs with Node.js and Express requires thoughtful planning and implementation of various features including proper routing, authentication, error handling, rate limiting, and documentation. By following the best practices outlined in this article, you can create APIs that are not only performant but also maintainable and secure.</p>
          `,
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
          content: `
          <p>Machine Learning is revolutionizing the way we approach problem-solving across various domains. In this introductory guide, we'll explore the fundamentals of machine learning and how to get started with TensorFlow 2.0.</p>
          
          <h2>What is Machine Learning?</h2>
          <p>Machine Learning is a subset of artificial intelligence that enables systems to learn from data, identify patterns, and make decisions with minimal human intervention. It's like teaching a computer to learn from experience, similar to how humans learn.</p>
          
          <h2>Types of Machine Learning</h2>
          <p>There are three main types of machine learning:</p>
          <ul>
            <li><strong>Supervised Learning:</strong> The algorithm learns from labeled training data, and makes predictions based on that data.</li>
            <li><strong>Unsupervised Learning:</strong> The algorithm learns from unlabeled data, identifying patterns and relationships.</li>
            <li><strong>Reinforcement Learning:</strong> The algorithm learns by interacting with an environment, receiving feedback in the form of rewards or penalties.</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Machine learning with TensorFlow offers incredible possibilities. As you continue your journey, explore more advanced topics like transfer learning, custom model architectures, and deployment strategies.</p>
          `,
          featuredImage: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
          authorId: 1,
          category: 'machine-learning',
          tags: ['tensorflow', 'machine-learning', 'ai', 'neural-networks'],
          isPublished: true,
          viewCount: 980,
          publishedAt: '2023-11-20T12:00:00Z',
          updatedAt: '2023-11-20T12:00:00Z',
        },
        {
          id: 3,
          title: 'Mastering CSS Grid Layout',
          slug: 'mastering-css-grid-layout',
          summary: 'Explore the power of CSS Grid Layout and learn how to create complex, responsive layouts with ease.',
          content: `
          <p>CSS Grid Layout is a two-dimensional layout system that revolutionizes the way we create web layouts. In this comprehensive guide, we'll explore how to master CSS Grid to build modern, responsive websites.</p>
          
          <h2>What is CSS Grid?</h2>
          <p>CSS Grid Layout (also known as Grid) is a two-dimensional grid-based layout system specifically designed for the CSS interface. It gives you the ability to place elements using rows and columns, making it much easier to design complex layouts compared to older methods.</p>
          
          <h2>Basic Grid Concepts</h2>
          <p>To create a grid container, you need to set the display property to 'grid' or 'inline-grid':</p>
          <pre><code>
            .container {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              grid-template-rows: 100px 200px;
              gap: 10px;
            }
          </code></pre>
          
          <h2>Conclusion</h2>
          <p>CSS Grid Layout provides a powerful toolset for creating complex web layouts. By mastering these techniques, you'll be able to implement designs that were previously challenging or impossible without resorting to hacks or complex JavaScript solutions.</p>
          `,
          featuredImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3NzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
          authorId: 2,
          category: 'frontend',
          tags: ['css', 'web-design', 'layout', 'responsive-design'],
          isPublished: true,
          viewCount: 875,
          publishedAt: '2024-01-05T12:00:00Z',
          updatedAt: '2024-01-05T12:00:00Z',
        },
      ] as BlogPost[];
    },
    enabled: !!slug
  });

  // Get the current post based on the slug
  const currentPost = useMemo(() => {
    if (!allPosts || !slug) return null;
    return allPosts.find(p => p.slug === slug) || null;
  }, [allPosts, slug]);

  // Find related posts (same category or matching tags)
  const relatedPosts = useMemo(() => {
    if (!currentPost || !allPosts) return [];
    
    return allPosts
      .filter(p => p.id !== currentPost.id) // Exclude current post
      .filter(p => 
        p.category === currentPost.category || 
        p.tags.some(tag => currentPost.tags.includes(tag))
      )
      .slice(0, 3); // Show max 3 related posts
  }, [currentPost, allPosts]);

  // Author information (mock for now)
  const author = useMemo(() => {
    if (!currentPost) return null;
    
    return {
      id: currentPost.authorId,
      name: "Ritik Mahyavanshi",
      bio: "Full-stack developer and technical writer with a passion for building innovative web applications.",
      avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
    };
  }, [currentPost]);

  // Update view count on page load
  useEffect(() => {
    if (currentPost) {
      // In a real app, we would make an API call to increment the view count
      console.log(`Viewing post: ${currentPost.title}`);
    }
  }, [currentPost]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-color)]">
        <SimpleNavbar />
        <main className="flex-grow pt-24 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="w-full h-72 bg-[var(--card-bg)] rounded-lg animate-pulse mb-6"></div>
              <div className="w-3/4 h-10 bg-[var(--card-bg)] rounded animate-pulse mb-4"></div>
              <div className="w-full h-4 bg-[var(--card-bg)] rounded animate-pulse mb-2"></div>
              <div className="w-full h-4 bg-[var(--card-bg)] rounded animate-pulse mb-2"></div>
              <div className="w-3/4 h-4 bg-[var(--card-bg)] rounded animate-pulse mb-6"></div>
              <div className="w-full h-64 bg-[var(--card-bg)] rounded animate-pulse"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-color)]">
        <SimpleNavbar />
        <main className="flex-grow pt-24 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold mb-4 text-[var(--dark-text)]">Post Not Found</h1>
            <p className="text-[var(--light-text)] mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button>
              <Link href="/blog" className="flex items-center">
                <FaArrowLeft className="mr-2" /> Back to Blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Build structured data for SEO
  const structuredData = useMemo(() => {
    if (!currentPost || !author) return undefined;
    
    // Create JSON-LD structured data for this blog article
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": currentPost.title,
      "description": currentPost.summary,
      "image": currentPost.featuredImage,
      "author": {
        "@type": "Person",
        "name": author.name
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ritik Mahyavanshi",
        "logo": {
          "@type": "ImageObject",
          "url": "https://images.unsplash.com/photo-1633332755192-727a05c4013d"
        }
      },
      "datePublished": currentPost.publishedAt,
      "dateModified": currentPost.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://ritikmahyavanshi.com/blog/${currentPost.slug}`
      },
      "keywords": currentPost.tags.join(", ")
    };
  }, [currentPost, author]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)]">
      {/* SEO optimization */}
      <SEOHead 
        title={`${currentPost.title} | Ritik Mahyavanshi`}
        description={currentPost.summary}
        keywords={currentPost.tags.join(", ")}
        ogType="article"
        ogImage={currentPost.featuredImage}
        canonical={`https://ritikmahyavanshi.com/blog/${currentPost.slug}`}
        structuredData={structuredData}
      />
      <SimpleNavbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link href="/blog">
              <Button variant="outline" size="sm" className="mb-6">
                <FaArrowLeft className="mr-2" /> Back to Blog
              </Button>
            </Link>
            
            {/* Featured image with lazy loading */}
            <div className="relative h-72 md:h-96 mb-8 overflow-hidden rounded-xl">
              <img 
                src={currentPost.featuredImage} 
                alt={currentPost.title} 
                className="w-full h-full object-cover transition-opacity duration-300"
                loading="lazy"
                onLoad={(e) => {
                  // Add a fade-in effect when image loads
                  (e.target as HTMLImageElement).classList.add('opacity-100');
                }}
                style={{ opacity: 0.6 }}
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary/90 text-white rounded-md capitalize">
                  {currentPost.category}
                </span>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--dark-text)] blog-title">{currentPost.title}</h1>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center mb-6 text-sm text-[var(--light-text)]">
              <div className="flex items-center mr-6">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(currentPost.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {currentPost.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[var(--card-bg-hover)] text-[var(--light-text)]"
                >
                  <FaTag className="mr-1" /> {tag}
                </span>
              ))}
            </div>
            
            {/* Author info - simplified */}
            {author && (
              <div className="mb-8 p-3 bg-[var(--card-bg)] rounded-lg inline-flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-[var(--dark-text)]">Author: {author.name}</h3>
                </div>
              </div>
            )}
            
            {/* Article content with enhanced code and image styling - with optimized Markdown processing */}
            <Suspense fallback={
              <div className="prose prose-lg max-w-none animate-pulse">
                <div className="h-6 bg-[var(--card-bg)] rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-[var(--card-bg)] rounded w-full mb-2"></div>
                <div className="h-4 bg-[var(--card-bg)] rounded w-full mb-2"></div>
                <div className="h-4 bg-[var(--card-bg)] rounded w-5/6 mb-6"></div>
                <div className="h-5 bg-[var(--card-bg)] rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-[var(--card-bg)] rounded w-full mb-2"></div>
                <div className="h-4 bg-[var(--card-bg)] rounded w-full mb-2"></div>
                <div className="h-40 bg-[var(--card-bg)] rounded w-full mb-6"></div>
              </div>
            }>
              <div 
                className="prose prose-lg max-w-none blog-content
                  prose-headings:text-[var(--dark-text)] 
                  prose-p:text-[var(--light-text)] 
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-[var(--dark-text)] 
                  prose-em:text-[var(--light-text)]
                  prose-blockquote:border-l-[var(--accent-color)]
                  prose-blockquote:bg-[var(--card-bg-hover)] prose-blockquote:py-1 prose-blockquote:px-4
                  prose-code:text-[var(--accent-color)] prose-code:bg-[var(--card-bg-hover)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:text-sm
                  prose-pre:bg-[var(--card-bg)] prose-pre:border prose-pre:border-[var(--card-border)] prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:shadow-sm
                  prose-pre:code:bg-transparent prose-pre:code:p-0
                  prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:my-8 prose-img:max-w-full prose-img:h-auto prose-img:loading-lazy
                  prose-ul:text-[var(--light-text)] prose-ol:text-[var(--light-text)]
                  prose-li:marker:text-primary
                  prose-blockquote:border-l-primary prose-blockquote:bg-[var(--card-bg-hover)] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ 
                  __html: currentPost.content.replace(/<img /g, '<img loading="lazy" class="rounded-lg shadow-md" ')
                }}
              />
            </Suspense>
            
            {/* Share section */}
            <div className="mt-12 pt-8 border-t border-[var(--card-border)]">
              <h3 className="text-xl font-bold mb-4 text-[var(--dark-text)]">Share this article</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" aria-label="Share on Twitter">
                  <i className="ri-twitter-fill text-lg"></i>
                </Button>
                <Button variant="outline" size="icon" aria-label="Share on Facebook">
                  <i className="ri-facebook-fill text-lg"></i>
                </Button>
                <Button variant="outline" size="icon" aria-label="Share on LinkedIn">
                  <i className="ri-linkedin-fill text-lg"></i>
                </Button>
                <Button variant="outline" size="icon" aria-label="Copy link">
                  <i className="ri-link text-lg"></i>
                </Button>
              </div>
            </div>
            
            {/* Related posts */}
            {/* Related posts with optimized loading */}
            <Suspense fallback={
              relatedPosts.length > 0 ? (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold mb-6 text-[var(--dark-text)]">Related Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-80 bg-[var(--card-bg)] rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ) : null
            }>
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold mb-6 text-[var(--dark-text)]">Related Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map(post => (
                      <Card key={post.id} className="bg-[var(--card-bg)] border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow duration-300">
                        <Link 
                          href={`/blog/${post.slug}`}
                          onMouseEnter={() => {
                            // Prefetch this post when hovering
                            queryClient.prefetchQuery({
                              queryKey: ['/api/blog-posts', post.slug],
                              queryFn: () => post
                            });
                          }}
                        >
                          <div className="h-48 relative overflow-hidden rounded-t-lg">
                            <img 
                              src={post.featuredImage} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-opacity duration-300 opacity-70"
                              loading="lazy"
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).classList.add('opacity-100');
                              }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-3 px-4">
                              <span className="text-xs font-medium text-white bg-primary/90 px-2 py-1 rounded">
                                {post.category}
                              </span>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-lg mb-2 line-clamp-2 text-[var(--dark-text)] blog-title">{post.title}</h4>
                            <p className="text-sm text-[var(--light-text)] line-clamp-3 mb-4">{post.summary}</p>
                            <div className="flex items-center text-xs text-[var(--light-text)]">
                              <FaCalendarAlt className="mr-1" />
                              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}