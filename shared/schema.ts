import { pgTable, text, serial, integer, boolean, jsonb, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Contact form schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Website content schema
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // e.g., 'hero', 'about', 'experience'
  key: text("key").notNull(), // e.g., 'title', 'description'
  value: text("value").notNull(),
  type: text("type").notNull().default("text"), // 'text', 'image', 'html', etc.
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertSiteContentSchema = createInsertSchema(siteContent).pick({
  section: true,
  key: true,
  value: true,
  type: true,
});

export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

// Projects schema for admin management
export const projectsContent = pgTable("projects_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(), // 'web', 'ui', 'mobile'
  technologies: text("technologies").array().notNull(),
  tags: text("tags").array().notNull(),
  link: text("link").notNull(),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertProjectSchema = createInsertSchema(projectsContent).pick({
  title: true,
  description: true,
  image: true,
  category: true,
  technologies: true,
  tags: true,
  link: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsContent.$inferSelect;

// Experience schema for admin management
export const experienceContent = pgTable("experience_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  period: text("period").notNull(),
  description: text("description").array().notNull(),
  technologies: text("technologies").array().notNull(),
  achievements: text("achievements").array().notNull(),
  category: text("category").notNull(), // 'backend', 'frontend', 'ai-ml', 'devops', 'management'
  logo: text("logo"),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertExperienceSchema = createInsertSchema(experienceContent).pick({
  title: true,
  company: true,
  location: true,
  period: true,
  description: true,
  technologies: true,
  achievements: true,
  category: true,
  logo: true,
});

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experienceContent.$inferSelect;

// Testimonials schema for admin management
export const testimonialsContent = pgTable("testimonials_content", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  company: text("company").notNull(),
  text: text("text").notNull(),
  image: text("image").notNull(),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertTestimonialSchema = createInsertSchema(testimonialsContent).pick({
  name: true,
  position: true,
  company: true,
  text: true,
  image: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsContent.$inferSelect;

// Resume templates and user resumes schemas have been removed

// Blog categories
export const blogCategories = pgEnum('blog_categories', [
  'tech', 'career', 'ai', 'ml', 'web-dev', 'backend', 'frontend', 'devops', 'tutorial', 'opinion'
]);

// Blog posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image").notNull(),
  authorId: integer("author_id").references(() => users.id),
  category: text("category").notNull(), // Using text instead of enum for simpler implementation
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  summary: true,
  content: true,
  featuredImage: true,
  authorId: true,
  category: true,
  tags: true,
  isPublished: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog comments
export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).pick({
  postId: true,
  name: true,
  email: true,
  content: true,
  isApproved: true,
});

export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;
export type BlogComment = typeof blogComments.$inferSelect;

// Skills with visualization data
export const skillsContent = pgTable("skills_content", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // e.g., 'Programming', 'Design', 'DevOps'
  proficiency: integer("proficiency").notNull(), // 0-100 percentage
  icon: text("icon"), // Icon identifier
  yearsExperience: text("years_experience"), // e.g. "3+ years"
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertSkillSchema = createInsertSchema(skillsContent).pick({
  name: true,
  category: true,
  proficiency: true,
  icon: true,
  yearsExperience: true,
});

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skillsContent.$inferSelect;

// Newsletter subscribers
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
  name: true,
  isActive: true,
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Language support
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., 'en', 'es', 'fr'
  name: text("name").notNull(), // e.g., 'English', 'Spanish', 'French'
  isActive: boolean("is_active").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

export const insertLanguageSchema = createInsertSchema(languages).pick({
  code: true,
  name: true,
  isActive: true,
  isDefault: true,
});

export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type Language = typeof languages.$inferSelect;

// Translations
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  languageCode: text("language_code").notNull().references(() => languages.code),
  key: text("key").notNull(), // Translation key
  value: text("value").notNull(), // Translated text
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertTranslationSchema = createInsertSchema(translations).pick({
  languageCode: true,
  key: true,
  value: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Social media profiles
export const socialProfiles = pgTable("social_profiles", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // e.g., 'linkedin', 'github', 'twitter'
  username: text("username").notNull(),
  profileUrl: text("profile_url").notNull(),
  displayName: text("display_name"), 
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  followerCount: integer("follower_count"),
  isConnected: boolean("is_connected").default(true).notNull(),
  lastSynced: text("last_synced").notNull().default(new Date().toISOString()),
  accessToken: text("access_token"), // Stored for auto-sync with platform APIs
  refreshToken: text("refresh_token"),
  tokenExpiry: text("token_expiry"),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertSocialProfileSchema = createInsertSchema(socialProfiles).pick({
  platform: true,
  username: true,
  profileUrl: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  followerCount: true,
  isConnected: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
});

export type InsertSocialProfile = z.infer<typeof insertSocialProfileSchema>;
export type SocialProfile = typeof socialProfiles.$inferSelect;
