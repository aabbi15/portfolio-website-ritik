import session from 'express-session';
import memorystore from 'memorystore';
import mongoose from 'mongoose';

// Import MongoDB models
import { 
  UserModel, IUser,
  ProjectModel, IProject,
  ExperienceModel, IExperience,
  ContactModel, IContact,
  SiteContentModel, ISiteContent,
  BlogPostModel, IBlogPost,
  BlogCommentModel, IBlogComment,
  SocialProfileModel, ISocialProfile,
  SkillModel, ISkill,
  TestimonialModel, ITestimonial
} from './database/models';

// Import helper functions
import { 
  isUsingFallbackStorage, 
  hasActiveConnection,
  getConnectionStatus 
} from './database/mongo';

import {
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  siteContent, type SiteContent, type InsertSiteContent,
  projectsContent, type Project, type InsertProject,
  experienceContent, type Experience, type InsertExperience,
  testimonialsContent, type Testimonial, type InsertTestimonial,
  // Resume-related types removed
  blogPosts, type BlogPost, type InsertBlogPost,
  blogComments, type BlogComment, type InsertBlogComment,
  skillsContent, type Skill, type InsertSkill,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  languages, type Language, type InsertLanguage, 
  translations, type Translation, type InsertTranslation,
  socialProfiles, type SocialProfile, type InsertSocialProfile
} from "@shared/schema";

// Interface with all CRUD methods needed for the application
export interface IStorage {
  // Session store
  sessionStore: any;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(username: string, password: string): Promise<User | null>;
  
  // Contact form methods
  createContact(contact: InsertContact): Promise<Contact>;
  getContact(id: number): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  
  // Site content methods
  getSiteContent(section: string, key: string): Promise<SiteContent | undefined>;
  getSiteContentsBySection(section: string): Promise<SiteContent[]>;
  upsertSiteContent(content: InsertSiteContent): Promise<SiteContent>;
  
  // Projects methods
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Experience methods
  getExperience(id: number): Promise<Experience | undefined>;
  getAllExperiences(): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
  
  // Testimonial methods
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Resume template and user resume methods removed
  
  // Blog post methods
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(filterOptions?: { isPublished?: boolean }): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementBlogPostViewCount(id: number): Promise<boolean>;
  
  // Blog comment methods
  getBlogComment(id: number): Promise<BlogComment | undefined>;
  getBlogCommentsByPostId(postId: number): Promise<BlogComment[]>;
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  updateBlogCommentApproval(id: number, isApproved: boolean): Promise<BlogComment | undefined>;
  deleteBlogComment(id: number): Promise<boolean>;
  
  // Skills methods
  getSkill(id: number): Promise<Skill | undefined>;
  getAllSkills(): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Newsletter methods
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllNewsletterSubscribers(onlyActive?: boolean): Promise<NewsletterSubscriber[]>;
  updateNewsletterSubscriberStatus(id: number, isActive: boolean): Promise<NewsletterSubscriber | undefined>;
  deleteNewsletterSubscriber(id: number): Promise<boolean>;
  
  // Language methods
  getLanguage(code: string): Promise<Language | undefined>;
  getAllLanguages(onlyActive?: boolean): Promise<Language[]>;
  getDefaultLanguage(): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  updateLanguage(code: string, language: Partial<InsertLanguage>): Promise<Language | undefined>;
  deleteLanguage(code: string): Promise<boolean>;
  
  // Translation methods
  getTranslation(languageCode: string, key: string): Promise<Translation | undefined>;
  getAllTranslations(languageCode: string): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: number, translation: Partial<InsertTranslation>): Promise<Translation | undefined>;
  deleteTranslation(id: number): Promise<boolean>;
  
  // Social Profile methods
  getSocialProfile(id: number): Promise<SocialProfile | undefined>;
  getSocialProfileByPlatform(platform: string): Promise<SocialProfile | undefined>;
  getAllSocialProfiles(): Promise<SocialProfile[]>;
  createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile>;
  updateSocialProfile(id: number, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined>;
  deleteSocialProfile(id: number): Promise<boolean>;
  syncSocialProfile(id: number): Promise<SocialProfile | undefined>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private siteContents: Map<string, SiteContent>; // key is section:key
  private projects: Map<number, Project>;
  private experiences: Map<number, Experience>;
  private testimonials: Map<number, Testimonial>;
  // Resume-related maps removed
  private blogPosts: Map<number, BlogPost>;
  private blogComments: Map<number, BlogComment>;
  private skills: Map<number, Skill>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private languages: Map<string, Language>; // key is language code
  private translations: Map<string, Translation>; // key is languageCode:translationKey
  private socialProfiles: Map<number, SocialProfile>;
  
  userCurrentId: number;
  contactCurrentId: number;
  siteContentCurrentId: number;
  projectCurrentId: number;
  experienceCurrentId: number;
  testimonialCurrentId: number;
  // Resume-related IDs removed
  blogPostCurrentId: number;
  blogCommentCurrentId: number;
  skillCurrentId: number;
  newsletterSubscriberCurrentId: number;
  languageCurrentId: number;
  translationCurrentId: number;
  socialProfileCurrentId: number;

  constructor() {
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.contacts = new Map();
    this.siteContents = new Map();
    this.projects = new Map();
    this.experiences = new Map();
    this.testimonials = new Map();
    // Resume-related maps removed
    this.blogPosts = new Map();
    this.blogComments = new Map();
    this.skills = new Map();
    this.newsletterSubscribers = new Map();
    this.languages = new Map();
    this.translations = new Map();
    this.socialProfiles = new Map();
    
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.siteContentCurrentId = 1;
    this.projectCurrentId = 1;
    this.experienceCurrentId = 1;
    this.testimonialCurrentId = 1;
    // Resume-related IDs removed
    this.blogPostCurrentId = 1;
    this.blogCommentCurrentId = 1;
    this.skillCurrentId = 1;
    this.newsletterSubscriberCurrentId = 1;
    this.languageCurrentId = 1;
    this.translationCurrentId = 1;
    this.socialProfileCurrentId = 1;
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This would be hashed in a real app
      isAdmin: true
    });
    
    // Initialize with default site content
    this.initDefaultContent();
  }
  
  // Initialize default site content
  private async initDefaultContent() {
    // Hero section
    await this.upsertSiteContent({
      section: "hero",
      key: "name",
      value: "Ritik Mahyavanshi",
      type: "text"
    });
    
    await this.upsertSiteContent({
      section: "hero",
      key: "role",
      value: "Full Stack Developer & AI Specialist",
      type: "text"
    });
    
    await this.upsertSiteContent({
      section: "hero",
      key: "photo",
      value: "/uploads/1672052819495.jpeg",
      type: "text"
    });
    
    // Default experiences
    await this.createExperience({
      title: "Research Assistant",
      company: "Speech Research Lab",
      location: "University of Illinois",
      period: "Jan 2022 - Feb 2023",
      description: [
        "Contributed to fundamental research in speech processing and natural language understanding.",
        "Developed algorithms for improved speech recognition in noisy environments.",
        "Collaborated with a team of PhD students and professors on cutting-edge research."
      ],
      technologies: ["Python", "TensorFlow", "PyTorch", "NLTK", "Jupyter", "Git"],
      achievements: [
        "Co-authored a research paper on noise-robust speech recognition.",
        "Improved recognition accuracy by 15% in challenging acoustic environments.",
        "Created a dataset of over 10,000 annotated speech samples."
      ],
      category: "ai-ml",
      logo: "https://cdn-icons-png.flaticon.com/512/2988/2988031.png"
    });
    
    await this.createExperience({
      title: "Machine Learning Intern",
      company: "AI Solutions Inc.",
      location: "Remote",
      period: "May 2021 - Aug 2021",
      description: [
        "Developed and deployed machine learning models for predictive analytics.",
        "Created data pipelines for processing and analyzing large datasets.",
        "Implemented deep learning algorithms for natural language processing tasks."
      ],
      technologies: ["Python", "Scikit-learn", "Pandas", "Docker", "AWS", "PostgreSQL"],
      achievements: [
        "Built a recommendation system that increased user engagement by 22%.",
        "Optimized ML pipeline to reduce training time by 40%.",
        "Presented findings to senior leadership team."
      ],
      category: "ai-ml",
      logo: "https://cdn-icons-png.flaticon.com/512/2103/2103633.png"
    });
    
    await this.createExperience({
      title: "Backend Developer",
      company: "TechStack Solutions",
      location: "Chicago, IL",
      period: "Mar 2023 - Present",
      description: [
        "Designed and implemented RESTful APIs for high-traffic applications.",
        "Architected distributed systems using microservices architecture.",
        "Developed data processing pipelines for real-time analytics."
      ],
      technologies: ["Node.js", "Express", "TypeScript", "MongoDB", "Redis", "Docker", "Kubernetes"],
      achievements: [
        "Reduced API response time by 65% through optimization and caching strategies.",
        "Implemented CI/CD pipeline reducing deployment time from hours to minutes.",
        "Led a team of 4 developers on a mission-critical project."
      ],
      category: "backend",
      logo: "https://cdn-icons-png.flaticon.com/512/6295/6295417.png"
    });
    
    // About section
    await this.upsertSiteContent({
      section: "about",
      key: "title",
      value: "Full Stack Developer & AI Engineer",
      type: "text"
    });
    
    await this.upsertSiteContent({
      section: "about",
      key: "bio",
      value: "I am a passionate Full Stack Developer with expertise in backend systems and AI development. With 5+ years of experience building scalable applications and implementing machine learning models, I bring a unique blend of technical abilities and problem-solving skills to every project.",
      type: "text"
    });
    
    await this.upsertSiteContent({
      section: "about",
      key: "photo",
      value: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1161&q=80",
      type: "text"
    });
    
    // Education details
    await this.upsertSiteContent({
      section: "about",
      key: "degree",
      value: "MS in Computer Science",
      type: "text"
    });
    
    await this.upsertSiteContent({
      section: "about",
      key: "degree_specialization",
      value: "Northeastern University, Silicon Valley",
      type: "text"
    });
    
    await this.upsertSiteContent({
      section: "about",
      key: "degree_period",
      value: "Sep'25 to May'27",
      type: "text"
    });
    
    // Add default social profiles
    await this.createSocialProfile({
      platform: "linkedin",
      username: "ritik-mahyavanshi",
      profileUrl: "https://www.linkedin.com/in/ritik-mahyavanshi/",
      displayName: "Ritik Mahyavanshi",
      isConnected: true
    });
    
    await this.createSocialProfile({
      platform: "github",
      username: "ritikmahyavanshi",
      profileUrl: "https://github.com/ritikmahyavanshi",
      displayName: "ritikmahyavanshi",
      isConnected: true
    });
    
    await this.createSocialProfile({
      platform: "twitter",
      username: "ritikm_dev",
      profileUrl: "https://twitter.com/ritikm_dev",
      displayName: "Ritik Mahyavanshi",
      isConnected: true
    });
    
    // Resume templates removed
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // Use false as the default value for isAdmin if it's undefined
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin ?? false 
    };
    this.users.set(id, user);
    return user;
  }
  
  async verifyUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
  
  // Contact form methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.contacts.set(id, contact);
    return contact;
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  // Site content methods
  async getSiteContent(section: string, key: string): Promise<SiteContent | undefined> {
    return this.siteContents.get(`${section}:${key}`);
  }
  
  async getSiteContentsBySection(section: string): Promise<SiteContent[]> {
    return Array.from(this.siteContents.values()).filter(
      content => content.section === section
    );
  }
  
  async upsertSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const compositeKey = `${content.section}:${content.key}`;
    const existingContent = this.siteContents.get(compositeKey);
    
    if (existingContent) {
      // Update existing content
      const updatedContent: SiteContent = {
        ...existingContent,
        value: content.value,
        // Only update the type if it's provided
        type: content.type || existingContent.type,
        updatedAt: new Date().toISOString()
      };
      this.siteContents.set(compositeKey, updatedContent);
      return updatedContent;
    } else {
      // Create new content
      const id = this.siteContentCurrentId++;
      const newContent: SiteContent = {
        id,
        section: content.section,
        key: content.key,
        value: content.value,
        // Default to 'text' if no type is provided
        type: content.type || 'text',
        updatedAt: new Date().toISOString()
      };
      this.siteContents.set(compositeKey, newContent);
      return newContent;
    }
  }
  
  // Projects methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const newProject: Project = {
      ...project,
      id,
      updatedAt: new Date().toISOString()
    };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = {
      ...existingProject,
      ...projectUpdate,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Experience methods
  async getExperience(id: number): Promise<Experience | undefined> {
    return this.experiences.get(id);
  }
  
  async getAllExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values());
  }
  
  async createExperience(experience: InsertExperience): Promise<Experience> {
    const id = this.experienceCurrentId++;
    const newExperience: Experience = {
      ...experience,
      id,
      logo: experience.logo || null, // Ensure logo is never undefined
      updatedAt: new Date().toISOString()
    };
    this.experiences.set(id, newExperience);
    return newExperience;
  }
  
  async updateExperience(id: number, experienceUpdate: Partial<InsertExperience>): Promise<Experience | undefined> {
    const existingExperience = this.experiences.get(id);
    if (!existingExperience) return undefined;
    
    const updatedExperience: Experience = {
      ...existingExperience,
      ...experienceUpdate,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.experiences.set(id, updatedExperience);
    return updatedExperience;
  }
  
  async deleteExperience(id: number): Promise<boolean> {
    return this.experiences.delete(id);
  }
  
  // Blog post methods
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug,
    );
  }
  
  async getAllBlogPosts(filterOptions?: { isPublished?: boolean }): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (filterOptions?.isPublished !== undefined) {
      posts = posts.filter(post => post.isPublished === filterOptions.isPublished);
    }
    
    // Sort by publishedAt date (most recent first)
    return posts.sort((a, b) => {
      if (!a.isPublished) return 1;
      if (!b.isPublished) return -1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostCurrentId++;
    const now = new Date().toISOString();
    
    const newPost: BlogPost = {
      id,
      title: post.title,
      category: post.category,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      featuredImage: post.featuredImage,
      tags: post.tags || null,
      authorId: post.authorId || null,
      isPublished: post.isPublished !== undefined ? post.isPublished : true,
      viewCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.blogPosts.set(id, newPost);
    return newPost;
  }
  
  async updateBlogPost(id: number, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = await this.getBlogPost(id);
    if (!post) return undefined;
    
    const now = new Date().toISOString();
    
    const updatedPost: BlogPost = {
      ...post,
      ...postUpdate,
      id,
      updatedAt: now
    };
    
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }
  
  async incrementBlogPostViewCount(id: number): Promise<boolean> {
    const post = await this.getBlogPost(id);
    if (!post) return false;
    
    const updatedPost: BlogPost = {
      ...post,
      viewCount: post.viewCount + 1
    };
    
    this.blogPosts.set(id, updatedPost);
    return true;
  }
  
  // Blog comment methods
  async getBlogComment(id: number): Promise<BlogComment | undefined> {
    return this.blogComments.get(id);
  }
  
  async getBlogCommentsByPostId(postId: number): Promise<BlogComment[]> {
    return Array.from(this.blogComments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const id = this.blogCommentCurrentId++;
    const now = new Date().toISOString();
    
    const newComment: BlogComment = {
      ...comment,
      id,
      isApproved: false,
      createdAt: now
    };
    
    this.blogComments.set(id, newComment);
    return newComment;
  }
  
  async updateBlogCommentApproval(id: number, isApproved: boolean): Promise<BlogComment | undefined> {
    const comment = await this.getBlogComment(id);
    if (!comment) return undefined;
    
    const updatedComment: BlogComment = {
      ...comment,
      isApproved
    };
    
    this.blogComments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteBlogComment(id: number): Promise<boolean> {
    return this.blogComments.delete(id);
  }
  
  // Skills methods
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return Array.from(this.skills.values())
      .filter(skill => skill.category.toLowerCase() === category.toLowerCase());
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillCurrentId++;
    const now = new Date().toISOString();
    
    const newSkill: Skill = {
      ...skill,
      id,
      icon: skill.icon || null,
      yearsExperience: skill.yearsExperience || null,
      updatedAt: now
    };
    
    this.skills.set(id, newSkill);
    return newSkill;
  }
  
  async updateSkill(id: number, skillUpdate: Partial<InsertSkill>): Promise<Skill | undefined> {
    const skill = await this.getSkill(id);
    if (!skill) return undefined;
    
    const updatedSkill: Skill = {
      ...skill,
      ...skillUpdate
    };
    
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }
  
  // Newsletter methods
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.newsletterSubscriberCurrentId++;
    const now = new Date().toISOString();
    
    const newSubscriber: NewsletterSubscriber = {
      ...subscriber,
      id,
      name: subscriber.name || null,
      isActive: subscriber.isActive !== undefined ? subscriber.isActive : true,
      createdAt: now
    };
    
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async getAllNewsletterSubscribers(onlyActive: boolean = false): Promise<NewsletterSubscriber[]> {
    const subscribers = Array.from(this.newsletterSubscribers.values());
    
    if (onlyActive) {
      return subscribers.filter(sub => sub.isActive);
    }
    
    return subscribers;
  }
  
  async updateNewsletterSubscriberStatus(id: number, isActive: boolean): Promise<NewsletterSubscriber | undefined> {
    const subscriber = this.newsletterSubscribers.get(id);
    if (!subscriber) return undefined;
    
    const updatedSubscriber: NewsletterSubscriber = {
      ...subscriber,
      isActive
    };
    
    this.newsletterSubscribers.set(id, updatedSubscriber);
    return updatedSubscriber;
  }
  
  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    return this.newsletterSubscribers.delete(id);
  }
  
  // Language methods
  async getLanguage(code: string): Promise<Language | undefined> {
    return this.languages.get(code);
  }
  
  async getAllLanguages(onlyActive: boolean = false): Promise<Language[]> {
    const languages = Array.from(this.languages.values());
    
    if (onlyActive) {
      return languages.filter(lang => lang.isActive);
    }
    
    return languages;
  }
  
  async getDefaultLanguage(): Promise<Language | undefined> {
    return Array.from(this.languages.values()).find(lang => lang.isDefault);
  }
  
  async createLanguage(language: InsertLanguage): Promise<Language> {
    const languageId = this.languageCurrentId++;
    
    const newLanguage: Language = {
      ...language,
      id: languageId,
      isActive: language.isActive !== undefined ? language.isActive : true,
      isDefault: language.isDefault !== undefined ? language.isDefault : false
    };
    
    this.languages.set(language.code, newLanguage);
    return newLanguage;
  }
  
  async updateLanguage(code: string, languageUpdate: Partial<InsertLanguage>): Promise<Language | undefined> {
    const language = await this.getLanguage(code);
    if (!language) return undefined;
    
    const updatedLanguage: Language = {
      ...language,
      ...languageUpdate
    };
    
    this.languages.set(code, updatedLanguage);
    return updatedLanguage;
  }
  
  async deleteLanguage(code: string): Promise<boolean> {
    return this.languages.delete(code);
  }
  
  // Translation methods
  async getTranslation(languageCode: string, key: string): Promise<Translation | undefined> {
    return this.translations.get(`${languageCode}:${key}`);
  }
  
  async getAllTranslations(languageCode: string): Promise<Translation[]> {
    return Array.from(this.translations.values())
      .filter(translation => translation.languageCode === languageCode);
  }
  
  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const id = this.translationCurrentId++;
    const now = new Date().toISOString();
    
    const newTranslation: Translation = {
      ...translation,
      id,
      updatedAt: now
    };
    
    this.translations.set(`${translation.languageCode}:${translation.key}`, newTranslation);
    return newTranslation;
  }
  
  async updateTranslation(id: number, translationUpdate: Partial<InsertTranslation>): Promise<Translation | undefined> {
    // Find translation by ID
    const translation = Array.from(this.translations.values()).find(t => t.id === id);
    if (!translation) return undefined;
    
    // Remove old key if languageCode or key was updated
    if (translationUpdate.languageCode || translationUpdate.key) {
      this.translations.delete(`${translation.languageCode}:${translation.key}`);
    }
    
    const updatedTranslation: Translation = {
      ...translation,
      ...translationUpdate
    };
    
    // Set with new key
    this.translations.set(`${updatedTranslation.languageCode}:${updatedTranslation.key}`, updatedTranslation);
    return updatedTranslation;
  }
  
  async deleteTranslation(id: number): Promise<boolean> {
    const translation = Array.from(this.translations.values()).find(t => t.id === id);
    if (!translation) return false;
    
    return this.translations.delete(`${translation.languageCode}:${translation.key}`);
  }
  
  // Testimonial methods
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;
    const newTestimonial: Testimonial = {
      ...testimonial,
      id,
      updatedAt: new Date().toISOString()
    };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
  
  async updateTestimonial(id: number, testimonialUpdate: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const existingTestimonial = this.testimonials.get(id);
    if (!existingTestimonial) return undefined;
    
    const updatedTestimonial: Testimonial = {
      ...existingTestimonial,
      ...testimonialUpdate,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonials.delete(id);
  }
  
  // Resume-related methods removed
  
  // Social Profile methods
  async getSocialProfile(id: number): Promise<SocialProfile | undefined> {
    return this.socialProfiles.get(id);
  }

  async getSocialProfileByPlatform(platform: string): Promise<SocialProfile | undefined> {
    return Array.from(this.socialProfiles.values()).find(
      profile => profile.platform.toLowerCase() === platform.toLowerCase()
    );
  }

  async getAllSocialProfiles(): Promise<SocialProfile[]> {
    return Array.from(this.socialProfiles.values());
  }

  async createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile> {
    const id = this.socialProfileCurrentId++;
    const now = new Date().toISOString();
    
    // Create a properly typed SocialProfile with no undefined values
    const newProfile: SocialProfile = {
      id,
      username: profile.username,
      platform: profile.platform,
      profileUrl: profile.profileUrl,
      isConnected: profile.isConnected !== undefined ? profile.isConnected : true,
      lastSynced: now,
      updatedAt: now,
      // Handle optional fields with null fallbacks
      displayName: profile.displayName || null,
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl || null,
      followerCount: profile.followerCount || null,
      accessToken: profile.accessToken || null,
      refreshToken: profile.refreshToken || null,
      tokenExpiry: profile.tokenExpiry || null
    };
    
    this.socialProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateSocialProfile(id: number, profileUpdate: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined> {
    const profile = await this.getSocialProfile(id);
    if (!profile) return undefined;
    
    const now = new Date().toISOString();
    
    // Create a properly typed updated profile
    const updatedProfile: SocialProfile = {
      ...profile,
      // Only update the fields that were provided
      username: profileUpdate.username || profile.username,
      platform: profileUpdate.platform || profile.platform,
      profileUrl: profileUpdate.profileUrl || profile.profileUrl,
      isConnected: profileUpdate.isConnected !== undefined ? profileUpdate.isConnected : profile.isConnected,
      displayName: profileUpdate.displayName !== undefined ? profileUpdate.displayName || null : profile.displayName,
      bio: profileUpdate.bio !== undefined ? profileUpdate.bio || null : profile.bio,
      avatarUrl: profileUpdate.avatarUrl !== undefined ? profileUpdate.avatarUrl || null : profile.avatarUrl,
      followerCount: profileUpdate.followerCount !== undefined ? profileUpdate.followerCount || null : profile.followerCount,
      accessToken: profileUpdate.accessToken !== undefined ? profileUpdate.accessToken || null : profile.accessToken,
      refreshToken: profileUpdate.refreshToken !== undefined ? profileUpdate.refreshToken || null : profile.refreshToken,
      tokenExpiry: profileUpdate.tokenExpiry !== undefined ? profileUpdate.tokenExpiry || null : profile.tokenExpiry,
      // Always update these fields
      id,
      updatedAt: now,
      lastSynced: profile.lastSynced
    };
    
    this.socialProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteSocialProfile(id: number): Promise<boolean> {
    return this.socialProfiles.delete(id);
  }

  async syncSocialProfile(id: number): Promise<SocialProfile | undefined> {
    const profile = await this.getSocialProfile(id);
    if (!profile) return undefined;
    
    // In a real implementation, we would fetch the latest data
    // from the social media API here
    
    const now = new Date().toISOString();
    
    // Simply create a new object with the same data but updated timestamps
    const updatedProfile: SocialProfile = {
      id: profile.id,
      username: profile.username,
      platform: profile.platform,
      profileUrl: profile.profileUrl,
      isConnected: profile.isConnected,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      followerCount: profile.followerCount,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      tokenExpiry: profile.tokenExpiry,
      lastSynced: now,
      updatedAt: now
    };
    
    this.socialProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
}

// Export a default instance of MemStorage
/**
 * MongoDB implementation of the storage interface
 * This will take over when MongoDB connection is successful
 */
export class MongoStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    console.log('MongoStorage initialized, connecting to MongoDB collections...');
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ id });
      if (!user) return undefined;
      
      return {
        id,
        username: user.username,
        password: user.passwordHash,
        isAdmin: user.isAdmin
      };
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return {
        id: Number(user._id),
        username: user.username,
        password: user.passwordHash,
        isAdmin: user.isAdmin
      };
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel({
        username: insertUser.username,
        passwordHash: insertUser.password, // This should be hashed in production
        isAdmin: insertUser.isAdmin ?? false
      });
      
      const savedUser = await newUser.save();
      
      return {
        id: Number(savedUser._id),
        username: savedUser.username,
        password: savedUser.passwordHash,
        isAdmin: savedUser.isAdmin
      };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new Error('Failed to create user');
    }
  }
  
  async verifyUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ username });
      if (!user || user.passwordHash !== password) return null;
      
      return {
        id: Number(user._id),
        username: user.username,
        password: user.passwordHash,
        isAdmin: user.isAdmin
      };
    } catch (error) {
      console.error('Error in verifyUser:', error);
      return null;
    }
  }
  
  // TODO: Implement the rest of the interface methods
  // For now, we're implementing a minimal subset to get the application working
  
  // Placeholder methods to satisfy the interface - they will be properly implemented as needed
  async createContact(contact: InsertContact): Promise<Contact> { throw new Error('Not implemented'); }
  async getContact(id: number): Promise<Contact | undefined> { return undefined; }
  async getAllContacts(): Promise<Contact[]> { return []; }
  async getSiteContent(section: string, key: string): Promise<SiteContent | undefined> { return undefined; }
  async getSiteContentsBySection(section: string): Promise<SiteContent[]> { return []; }
  async upsertSiteContent(content: InsertSiteContent): Promise<SiteContent> { throw new Error('Not implemented'); }
  async getProject(id: number): Promise<Project | undefined> { return undefined; }
  async getAllProjects(): Promise<Project[]> { return []; }
  async createProject(project: InsertProject): Promise<Project> { throw new Error('Not implemented'); }
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> { return undefined; }
  async deleteProject(id: number): Promise<boolean> { return false; }
  async getExperience(id: number): Promise<Experience | undefined> { return undefined; }
  async getAllExperiences(): Promise<Experience[]> { return []; }
  async createExperience(experience: InsertExperience): Promise<Experience> { throw new Error('Not implemented'); }
  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined> { return undefined; }
  async deleteExperience(id: number): Promise<boolean> { return false; }
  async getTestimonial(id: number): Promise<Testimonial | undefined> { return undefined; }
  async getAllTestimonials(): Promise<Testimonial[]> { return []; }
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> { throw new Error('Not implemented'); }
  async updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined> { return undefined; }
  async deleteTestimonial(id: number): Promise<boolean> { return false; }
  async getBlogPost(id: number): Promise<BlogPost | undefined> { return undefined; }
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> { return undefined; }
  async getAllBlogPosts(filterOptions?: { isPublished?: boolean }): Promise<BlogPost[]> { return []; }
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> { throw new Error('Not implemented'); }
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> { return undefined; }
  async deleteBlogPost(id: number): Promise<boolean> { return false; }
  async incrementBlogPostViewCount(id: number): Promise<boolean> { return false; }
  async getBlogComment(id: number): Promise<BlogComment | undefined> { return undefined; }
  async getBlogCommentsByPostId(postId: number): Promise<BlogComment[]> { return []; }
  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> { throw new Error('Not implemented'); }
  async updateBlogCommentApproval(id: number, isApproved: boolean): Promise<BlogComment | undefined> { return undefined; }
  async deleteBlogComment(id: number): Promise<boolean> { return false; }
  async getSkill(id: number): Promise<Skill | undefined> { return undefined; }
  async getAllSkills(): Promise<Skill[]> { return []; }
  async getSkillsByCategory(category: string): Promise<Skill[]> { return []; }
  async createSkill(skill: InsertSkill): Promise<Skill> { throw new Error('Not implemented'); }
  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> { return undefined; }
  async deleteSkill(id: number): Promise<boolean> { return false; }
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> { throw new Error('Not implemented'); }
  async getAllNewsletterSubscribers(onlyActive?: boolean): Promise<NewsletterSubscriber[]> { return []; }
  async updateNewsletterSubscriberStatus(id: number, isActive: boolean): Promise<NewsletterSubscriber | undefined> { return undefined; }
  async deleteNewsletterSubscriber(id: number): Promise<boolean> { return false; }
  async getLanguage(code: string): Promise<Language | undefined> { return undefined; }
  async getAllLanguages(onlyActive?: boolean): Promise<Language[]> { return []; }
  async getDefaultLanguage(): Promise<Language | undefined> { return undefined; }
  async createLanguage(language: InsertLanguage): Promise<Language> { throw new Error('Not implemented'); }
  async updateLanguage(code: string, language: Partial<InsertLanguage>): Promise<Language | undefined> { return undefined; }
  async deleteLanguage(code: string): Promise<boolean> { return false; }
  async getTranslation(languageCode: string, key: string): Promise<Translation | undefined> { return undefined; }
  async getAllTranslations(languageCode: string): Promise<Translation[]> { return []; }
  async createTranslation(translation: InsertTranslation): Promise<Translation> { throw new Error('Not implemented'); }
  async updateTranslation(id: number, translation: Partial<InsertTranslation>): Promise<Translation | undefined> { return undefined; }
  async deleteTranslation(id: number): Promise<boolean> { return false; }
  async getSocialProfile(id: number): Promise<SocialProfile | undefined> {
    try {
      const profile = await SocialProfileModel.findOne({ id });
      if (!profile) return undefined;
      
      return {
        id,
        platform: profile.platform,
        username: profile.username,
        profileUrl: profile.url,
        displayName: profile.username,
        bio: null,
        avatarUrl: profile.icon || null,
        followerCount: profile.followers || null,
        isConnected: profile.display,
        lastSynced: profile.lastSynced ? profile.lastSynced.toISOString() : new Date().toISOString(),
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getSocialProfile:', error);
      return undefined;
    }
  }
  
  async getSocialProfileByPlatform(platform: string): Promise<SocialProfile | undefined> {
    try {
      const profile = await SocialProfileModel.findOne({ 
        platform: { $regex: new RegExp('^' + platform + '$', 'i') } 
      });
      
      if (!profile) return undefined;
      
      return {
        id: Number(profile._id),
        platform: profile.platform,
        username: profile.username,
        profileUrl: profile.url,
        displayName: profile.username,
        bio: null,
        avatarUrl: profile.icon || null,
        followerCount: profile.followers || null,
        isConnected: profile.display,
        lastSynced: profile.lastSynced ? profile.lastSynced.toISOString() : new Date().toISOString(),
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getSocialProfileByPlatform:', error);
      return undefined;
    }
  }
  
  async getAllSocialProfiles(): Promise<SocialProfile[]> {
    try {
      const profiles = await SocialProfileModel.find({});
      
      return profiles.map(profile => ({
        id: Number(profile._id),
        platform: profile.platform,
        username: profile.username,
        profileUrl: profile.url,
        displayName: profile.username,
        bio: null,
        avatarUrl: profile.icon || null,
        followerCount: profile.followers || null,
        isConnected: profile.display,
        lastSynced: profile.lastSynced ? profile.lastSynced.toISOString() : new Date().toISOString(),
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error in getAllSocialProfiles:', error);
      return [];
    }
  }
  
  async createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile> {
    try {
      const newProfile = new SocialProfileModel({
        platform: profile.platform,
        username: profile.username,
        url: profile.profileUrl,
        icon: profile.avatarUrl || 'default-icon',
        display: profile.isConnected !== undefined ? profile.isConnected : true,
        order: 0,
        followers: profile.followerCount || 0,
        lastSynced: new Date()
      });
      
      const savedProfile = await newProfile.save();
      
      return {
        id: Number(savedProfile._id),
        platform: savedProfile.platform,
        username: savedProfile.username,
        profileUrl: savedProfile.url,
        displayName: profile.displayName || savedProfile.username,
        bio: profile.bio || null,
        avatarUrl: savedProfile.icon || null,
        followerCount: savedProfile.followers || null,
        isConnected: savedProfile.display,
        lastSynced: savedProfile.lastSynced ? savedProfile.lastSynced.toISOString() : new Date().toISOString(),
        accessToken: profile.accessToken || null,
        refreshToken: profile.refreshToken || null,
        tokenExpiry: profile.tokenExpiry || null,
        updatedAt: savedProfile.updatedAt ? savedProfile.updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in createSocialProfile:', error);
      throw new Error('Failed to create social profile');
    }
  }
  
  async updateSocialProfile(id: number, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined> {
    try {
      const existingProfile = await SocialProfileModel.findOne({ id });
      if (!existingProfile) return undefined;
      
      const updateData: any = {};
      
      if (profile.platform) updateData.platform = profile.platform;
      if (profile.username) updateData.username = profile.username;
      if (profile.profileUrl) updateData.url = profile.profileUrl;
      if (profile.avatarUrl) updateData.icon = profile.avatarUrl;
      if (profile.isConnected !== undefined) updateData.display = profile.isConnected;
      if (profile.followerCount !== undefined) updateData.followers = profile.followerCount;
      
      // Set last updated time
      updateData.lastSynced = new Date();
      
      const updatedProfile = await SocialProfileModel.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      );
      
      if (!updatedProfile) return undefined;
      
      return {
        id,
        platform: updatedProfile.platform,
        username: updatedProfile.username,
        profileUrl: updatedProfile.url,
        displayName: profile.displayName || updatedProfile.username,
        bio: profile.bio || null,
        avatarUrl: updatedProfile.icon || null,
        followerCount: updatedProfile.followers || null,
        isConnected: updatedProfile.display,
        lastSynced: updatedProfile.lastSynced ? updatedProfile.lastSynced.toISOString() : new Date().toISOString(),
        accessToken: profile.accessToken || null,
        refreshToken: profile.refreshToken || null,
        tokenExpiry: profile.tokenExpiry || null,
        updatedAt: updatedProfile.updatedAt ? updatedProfile.updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in updateSocialProfile:', error);
      return undefined;
    }
  }
  
  async deleteSocialProfile(id: number): Promise<boolean> {
    try {
      const result = await SocialProfileModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error in deleteSocialProfile:', error);
      return false;
    }
  }
  
  async syncSocialProfile(id: number): Promise<SocialProfile | undefined> {
    try {
      const profile = await SocialProfileModel.findOne({ id });
      if (!profile) return undefined;
      
      // Update the lastSynced timestamp
      profile.lastSynced = new Date();
      await profile.save();
      
      return {
        id,
        platform: profile.platform,
        username: profile.username,
        profileUrl: profile.url,
        displayName: profile.username,
        bio: null,
        avatarUrl: profile.icon || null,
        followerCount: profile.followers || null,
        isConnected: profile.display,
        lastSynced: profile.lastSynced.toISOString(),
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        updatedAt: profile.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error in syncSocialProfile:', error);
      return undefined;
    }
  }
}

// Choose the appropriate storage implementation based on MongoDB connection status
// We create a unified storage interface that attempts to use MongoDB first
// and falls back to memory storage if the operation fails
class UnifiedStorage implements IStorage {
  private mongoStorage: MongoStorage;
  private memStorage: MemStorage;
  sessionStore: session.Store;
  
  constructor() {
    // Initialize both storage implementations but use the appropriate one based on MongoDB connection
    this.mongoStorage = new MongoStorage();
    this.memStorage = new MemStorage();
    
    // Use memory session store regardless of which storage is active
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      max: 1000             // Maximum number of sessions to prevent memory leaks
    });
    
    // Log initial storage status
    console.log(`Storage status: ${getConnectionStatus()}`);
    
    // Report whether we're using MongoDB or fallback
    if (isUsingFallbackStorage()) {
      console.log('NOTICE: Using in-memory storage (data will not persist across restarts)');
    } else if (hasActiveConnection()) {
      console.log('NOTICE: Successfully connected to MongoDB (data will persist)');
    } else {
      console.log('NOTICE: MongoDB connection pending or not yet established');
    }
  }
  
  // Helper method to determine which storage to use
  private getActiveStorage(): IStorage {
    // First check if we're using fallback storage due to connection issues
    if (isUsingFallbackStorage()) {
      return this.memStorage;
    }
    
    // Then check if we have an active connection
    if (hasActiveConnection()) {
      return this.mongoStorage;
    }
    
    // If neither condition is met, use memory storage
    console.log('MongoDB connection not ready, temporarily using in-memory storage');
    return this.memStorage;
  }
  
  // Helper to wrap storage methods with fallback logic
  private async withFallback<T>(
    operation: (storage: IStorage) => Promise<T>,
    methodName: string
  ): Promise<T> {
    try {
      // First attempt with the active storage (MongoDB or memory)
      return await operation(this.getActiveStorage());
    } catch (error) {
      console.error(`Error in ${methodName}, trying fallback:`, error instanceof Error ? error.message : String(error));
      
      // If the active storage was MongoDB and it failed, try with memory storage
      if (!isUsingFallbackStorage() && hasActiveConnection()) {
        console.log(`Falling back to memory storage for operation: ${methodName}`);
        return await operation(this.memStorage);
      }
      
      // If it wasn't MongoDB or we're already in fallback mode, just throw
      throw error;
    }
  }
  
  // Implement IStorage interface with fallback support
  async getUser(id: number): Promise<User | undefined> {
    return this.withFallback(storage => storage.getUser(id), 'getUser');
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.withFallback(storage => storage.getUserByUsername(username), 'getUserByUsername');
  }
  
  async createUser(user: InsertUser): Promise<User> {
    return this.withFallback(storage => storage.createUser(user), 'createUser');
  }
  
  async verifyUser(username: string, password: string): Promise<User | null> {
    return this.withFallback(storage => storage.verifyUser(username, password), 'verifyUser');
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    return this.withFallback(storage => storage.createContact(contact), 'createContact');
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.withFallback(storage => storage.getContact(id), 'getContact');
  }
  
  async getAllContacts(): Promise<Contact[]> {
    return this.withFallback(storage => storage.getAllContacts(), 'getAllContacts');
  }
  
  async getSiteContent(section: string, key: string): Promise<SiteContent | undefined> {
    return this.withFallback(storage => storage.getSiteContent(section, key), 'getSiteContent');
  }
  
  async getSiteContentsBySection(section: string): Promise<SiteContent[]> {
    return this.withFallback(storage => storage.getSiteContentsBySection(section), 'getSiteContentsBySection');
  }
  
  async upsertSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    return this.withFallback(storage => storage.upsertSiteContent(content), 'upsertSiteContent');
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.withFallback(storage => storage.getProject(id), 'getProject');
  }
  
  async getAllProjects(): Promise<Project[]> {
    return this.withFallback(storage => storage.getAllProjects(), 'getAllProjects');
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    return this.withFallback(storage => storage.createProject(project), 'createProject');
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    return this.withFallback(storage => storage.updateProject(id, project), 'updateProject');
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteProject(id), 'deleteProject');
  }
  
  async getExperience(id: number): Promise<Experience | undefined> {
    return this.withFallback(storage => storage.getExperience(id), 'getExperience');
  }
  
  async getAllExperiences(): Promise<Experience[]> {
    return this.withFallback(storage => storage.getAllExperiences(), 'getAllExperiences');
  }
  
  async createExperience(experience: InsertExperience): Promise<Experience> {
    return this.withFallback(storage => storage.createExperience(experience), 'createExperience');
  }
  
  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined> {
    return this.withFallback(storage => storage.updateExperience(id, experience), 'updateExperience');
  }
  
  async deleteExperience(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteExperience(id), 'deleteExperience');
  }
  
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.withFallback(storage => storage.getTestimonial(id), 'getTestimonial');
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    return this.withFallback(storage => storage.getAllTestimonials(), 'getAllTestimonials');
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    return this.withFallback(storage => storage.createTestimonial(testimonial), 'createTestimonial');
  }
  
  async updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    return this.withFallback(storage => storage.updateTestimonial(id, testimonial), 'updateTestimonial');
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteTestimonial(id), 'deleteTestimonial');
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.withFallback(storage => storage.getBlogPost(id), 'getBlogPost');
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return this.withFallback(storage => storage.getBlogPostBySlug(slug), 'getBlogPostBySlug');
  }
  
  async getAllBlogPosts(filterOptions?: { isPublished?: boolean }): Promise<BlogPost[]> {
    return this.withFallback(storage => storage.getAllBlogPosts(filterOptions), 'getAllBlogPosts');
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    return this.withFallback(storage => storage.createBlogPost(post), 'createBlogPost');
  }
  
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    return this.withFallback(storage => storage.updateBlogPost(id, post), 'updateBlogPost');
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteBlogPost(id), 'deleteBlogPost');
  }
  
  async incrementBlogPostViewCount(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.incrementBlogPostViewCount(id), 'incrementBlogPostViewCount');
  }
  
  async getBlogComment(id: number): Promise<BlogComment | undefined> {
    return this.withFallback(storage => storage.getBlogComment(id), 'getBlogComment');
  }
  
  async getBlogCommentsByPostId(postId: number): Promise<BlogComment[]> {
    return this.withFallback(storage => storage.getBlogCommentsByPostId(postId), 'getBlogCommentsByPostId');
  }
  
  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    return this.withFallback(storage => storage.createBlogComment(comment), 'createBlogComment');
  }
  
  async updateBlogCommentApproval(id: number, isApproved: boolean): Promise<BlogComment | undefined> {
    return this.withFallback(storage => storage.updateBlogCommentApproval(id, isApproved), 'updateBlogCommentApproval');
  }
  
  async deleteBlogComment(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteBlogComment(id), 'deleteBlogComment');
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.withFallback(storage => storage.getSkill(id), 'getSkill');
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return this.withFallback(storage => storage.getAllSkills(), 'getAllSkills');
  }
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return this.withFallback(storage => storage.getSkillsByCategory(category), 'getSkillsByCategory');
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    return this.withFallback(storage => storage.createSkill(skill), 'createSkill');
  }
  
  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    return this.withFallback(storage => storage.updateSkill(id, skill), 'updateSkill');
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteSkill(id), 'deleteSkill');
  }
  
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    return this.withFallback(storage => storage.createNewsletterSubscriber(subscriber), 'createNewsletterSubscriber');
  }
  
  async getAllNewsletterSubscribers(onlyActive?: boolean): Promise<NewsletterSubscriber[]> {
    return this.withFallback(storage => storage.getAllNewsletterSubscribers(onlyActive), 'getAllNewsletterSubscribers');
  }
  
  async updateNewsletterSubscriberStatus(id: number, isActive: boolean): Promise<NewsletterSubscriber | undefined> {
    return this.withFallback(storage => storage.updateNewsletterSubscriberStatus(id, isActive), 'updateNewsletterSubscriberStatus');
  }
  
  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteNewsletterSubscriber(id), 'deleteNewsletterSubscriber');
  }
  
  async getLanguage(code: string): Promise<Language | undefined> {
    return this.withFallback(storage => storage.getLanguage(code), 'getLanguage');
  }
  
  async getAllLanguages(onlyActive?: boolean): Promise<Language[]> {
    return this.withFallback(storage => storage.getAllLanguages(onlyActive), 'getAllLanguages');
  }
  
  async getDefaultLanguage(): Promise<Language | undefined> {
    return this.withFallback(storage => storage.getDefaultLanguage(), 'getDefaultLanguage');
  }
  
  async createLanguage(language: InsertLanguage): Promise<Language> {
    return this.withFallback(storage => storage.createLanguage(language), 'createLanguage');
  }
  
  async updateLanguage(code: string, language: Partial<InsertLanguage>): Promise<Language | undefined> {
    return this.withFallback(storage => storage.updateLanguage(code, language), 'updateLanguage');
  }
  
  async deleteLanguage(code: string): Promise<boolean> {
    return this.withFallback(storage => storage.deleteLanguage(code), 'deleteLanguage');
  }
  
  async getTranslation(languageCode: string, key: string): Promise<Translation | undefined> {
    return this.withFallback(storage => storage.getTranslation(languageCode, key), 'getTranslation');
  }
  
  async getAllTranslations(languageCode: string): Promise<Translation[]> {
    return this.withFallback(storage => storage.getAllTranslations(languageCode), 'getAllTranslations');
  }
  
  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    return this.withFallback(storage => storage.createTranslation(translation), 'createTranslation');
  }
  
  async updateTranslation(id: number, translation: Partial<InsertTranslation>): Promise<Translation | undefined> {
    return this.withFallback(storage => storage.updateTranslation(id, translation), 'updateTranslation');
  }
  
  async deleteTranslation(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteTranslation(id), 'deleteTranslation');
  }
  
  async getSocialProfile(id: number): Promise<SocialProfile | undefined> {
    return this.withFallback(storage => storage.getSocialProfile(id), 'getSocialProfile');
  }
  
  async getSocialProfileByPlatform(platform: string): Promise<SocialProfile | undefined> {
    return this.withFallback(storage => storage.getSocialProfileByPlatform(platform), 'getSocialProfileByPlatform');
  }
  
  async getAllSocialProfiles(): Promise<SocialProfile[]> {
    return this.withFallback(storage => storage.getAllSocialProfiles(), 'getAllSocialProfiles');
  }
  
  async createSocialProfile(profile: InsertSocialProfile): Promise<SocialProfile> {
    return this.withFallback(storage => storage.createSocialProfile(profile), 'createSocialProfile');
  }
  
  async updateSocialProfile(id: number, profile: Partial<InsertSocialProfile>): Promise<SocialProfile | undefined> {
    return this.withFallback(storage => storage.updateSocialProfile(id, profile), 'updateSocialProfile');
  }
  
  async deleteSocialProfile(id: number): Promise<boolean> {
    return this.withFallback(storage => storage.deleteSocialProfile(id), 'deleteSocialProfile');
  }
  
  async syncSocialProfile(id: number): Promise<SocialProfile | undefined> {
    return this.withFallback(storage => storage.syncSocialProfile(id), 'syncSocialProfile');
  }
}

// Create and export a single instance of the unified storage
export const storage = new UnifiedStorage();
