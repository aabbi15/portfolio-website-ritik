import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSchema, 
  insertUserSchema, 
  insertProjectSchema,
  insertExperienceSchema,
  insertSiteContentSchema,
  insertTestimonialSchema,
  insertBlogPostSchema,
  insertBlogCommentSchema,
  // Resume-related schema removed
  SiteContent,
  InsertSiteContent,
  BlogPost,
  BlogComment
} from "@shared/schema";
import { isAuthenticated, isAdmin } from "./middleware/auth";
import { setupAuth } from "./auth";
import { saveFile, deleteFile } from "./utils/fileStorage";

import { InsertSocialProfile, insertSocialProfileSchema } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // --- PUBLIC ROUTES ---
  
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the form data
      const validationResult = insertContactSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid form data",
          errors: validationResult.error.errors
        });
      }
      
      // Store the contact form submission
      const contact = await storage.createContact(validationResult.data);
      
      return res.status(201).json({
        message: "Message sent successfully",
        id: contact.id
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      return res.status(500).json({
        message: "Failed to process your message. Please try again later."
      });
    }
  });
  
  // Authentication route for admin login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          message: "Username and password are required"
        });
      }
      
      const user = await storage.verifyUser(username, password);
      
      if (!user) {
        return res.status(401).json({
          message: "Invalid username or password"
        });
      }
      
      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };
      
      return res.status(200).json({
        message: "Authentication successful",
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Error during authentication:", error);
      return res.status(500).json({
        message: "Authentication failed. Please try again later."
      });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to logout. Please try again."
        });
      }
      
      res.status(200).json({
        message: "Logout successful"
      });
    });
  });
  
  // Check if currently authenticated
  app.get("/api/auth/me", (req, res) => {
    if (req.session && req.session.user) {
      return res.status(200).json({
        authenticated: true,
        user: req.session.user
      });
    }
    
    return res.status(200).json({
      authenticated: false
    });
  });
  
  // Public API endpoints for fetching content
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      return res.status(200).json(projects);
    } catch (error) {
      console.error("Error retrieving projects:", error);
      return res.status(500).json({
        message: "Failed to retrieve projects."
      });
    }
  });
  
  // Get a specific project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid project ID"
        });
      }
      
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({
          message: "Project not found"
        });
      }
      
      return res.status(200).json(project);
    } catch (error) {
      console.error("Error retrieving project:", error);
      return res.status(500).json({
        message: "Failed to retrieve project."
      });
    }
  });
  
  // Get all experiences
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      return res.status(200).json(experiences);
    } catch (error) {
      console.error("Error retrieving experiences:", error);
      return res.status(500).json({
        message: "Failed to retrieve experiences."
      });
    }
  });

  // Create a new experience (public API for testing)
  app.post("/api/experiences", async (req, res) => {
    try {
      const validationResult = insertExperienceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid experience data",
          errors: validationResult.error.errors
        });
      }
      
      const experience = await storage.createExperience(validationResult.data);
      
      return res.status(201).json({
        message: "Experience created successfully",
        experience
      });
    } catch (error) {
      console.error("Error creating experience:", error);
      return res.status(500).json({
        message: "Failed to create experience."
      });
    }
  });
  
  // Get a specific experience
  app.get("/api/experiences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid experience ID"
        });
      }
      
      const experience = await storage.getExperience(id);
      
      if (!experience) {
        return res.status(404).json({
          message: "Experience not found"
        });
      }
      
      return res.status(200).json(experience);
    } catch (error) {
      console.error("Error retrieving experience:", error);
      return res.status(500).json({
        message: "Failed to retrieve experience."
      });
    }
  });
  
  // Get all site content
  app.get("/api/content", async (req, res) => {
    try {
      // Get all sections
      const allSections = ["hero", "about", "experience", "projects", "contact", "footer"];
      let allContent: SiteContent[] = [];
      
      // Collect content from all sections
      for (const section of allSections) {
        const contents = await storage.getSiteContentsBySection(section);
        if (contents && contents.length > 0) {
          allContent = [...allContent, ...contents];
        }
      }
      
      return res.status(200).json(allContent);
    } catch (error) {
      console.error("Error retrieving all site content:", error);
      return res.status(500).json({
        message: "Failed to retrieve all site content."
      });
    }
  });
  
  // Get site content by section
  app.get("/api/content/:section", async (req, res) => {
    try {
      const section = req.params.section;
      const contents = await storage.getSiteContentsBySection(section);
      
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Error retrieving site content:", error);
      return res.status(500).json({
        message: "Failed to retrieve site content."
      });
    }
  });
  
  // Get specific site content
  app.get("/api/content/:section/:key", async (req, res) => {
    try {
      const { section, key } = req.params;
      const content = await storage.getSiteContent(section, key);
      
      if (!content) {
        return res.status(404).json({
          message: "Content not found"
        });
      }
      
      return res.status(200).json(content);
    } catch (error) {
      console.error("Error retrieving site content:", error);
      return res.status(500).json({
        message: "Failed to retrieve site content."
      });
    }
  });
  
  // Update specific site content (public route for development purposes)
  app.post("/api/content/:section/:key", async (req, res) => {
    try {
      const { section, key } = req.params;
      const { value, type } = req.body;
      
      if (!section || !key || !value) {
        return res.status(400).json({
          message: "Section, key, and value are required"
        });
      }
      
      const updateData: InsertSiteContent = {
        section,
        key,
        value,
        type: type || 'text'
      };
      
      // If content is image type and contains a base64 data URI, save it as a file
      if (type === 'image' && value.startsWith('data:image')) {
        const filePath = await saveFile(value);
        // Update the value to be the file path instead of base64 data
        updateData.value = filePath;
      }
      
      const content = await storage.upsertSiteContent(updateData);
      
      return res.status(200).json({
        message: "Content updated successfully",
        content
      });
    } catch (error) {
      console.error("Error updating site content:", error);
      return res.status(500).json({
        message: "Failed to update site content."
      });
    }
  });
  
  // Get all testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      return res.status(200).json(testimonials);
    } catch (error) {
      console.error("Error retrieving testimonials:", error);
      return res.status(500).json({
        message: "Failed to retrieve testimonials."
      });
    }
  });
  
  // Get a specific testimonial
  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid testimonial ID"
        });
      }
      
      const testimonial = await storage.getTestimonial(id);
      
      if (!testimonial) {
        return res.status(404).json({
          message: "Testimonial not found"
        });
      }
      
      return res.status(200).json(testimonial);
    } catch (error) {
      console.error("Error retrieving testimonial:", error);
      return res.status(500).json({
        message: "Failed to retrieve testimonial."
      });
    }
  });
  
  // --- SOCIAL MEDIA PROFILES ---
  
  // Get all social profiles
  app.get("/api/social-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllSocialProfiles();
      return res.status(200).json(profiles);
    } catch (error) {
      console.error("Error retrieving social profiles:", error);
      return res.status(500).json({
        message: "Failed to retrieve social profiles."
      });
    }
  });
  
  // Get a specific social profile
  app.get("/api/social-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid social profile ID"
        });
      }
      
      const profile = await storage.getSocialProfile(id);
      
      if (!profile) {
        return res.status(404).json({
          message: "Social profile not found"
        });
      }
      
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Error retrieving social profile:", error);
      return res.status(500).json({
        message: "Failed to retrieve social profile."
      });
    }
  });
  
  // Get a social profile by platform
  app.get("/api/social-profiles/platform/:platform", async (req, res) => {
    try {
      const platform = req.params.platform;
      const profile = await storage.getSocialProfileByPlatform(platform);
      
      if (!profile) {
        return res.status(404).json({
          message: "Social profile not found for this platform"
        });
      }
      
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Error retrieving social profile by platform:", error);
      return res.status(500).json({
        message: "Failed to retrieve social profile."
      });
    }
  });
  
  // Sync a social profile (public for testing, would be authenticated in production)
  app.post("/api/social-profiles/:id/sync", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid social profile ID"
        });
      }
      
      const profile = await storage.syncSocialProfile(id);
      
      if (!profile) {
        return res.status(404).json({
          message: "Social profile not found"
        });
      }
      
      return res.status(200).json({
        message: "Social profile synced successfully",
        profile
      });
    } catch (error) {
      console.error("Error syncing social profile:", error);
      return res.status(500).json({
        message: "Failed to sync social profile."
      });
    }
  });
  
  // --- PROTECTED ADMIN ROUTES ---
  
  // Get all contact form submissions (admin only)
  app.get("/api/admin/contacts", isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      return res.status(200).json(contacts);
    } catch (error) {
      console.error("Error retrieving contacts:", error);
      return res.status(500).json({
        message: "Failed to retrieve contacts."
      });
    }
  });
  
  // --- PROJECT MANAGEMENT ---
  
  // Create a new project (admin only)
  app.post("/api/admin/projects", isAdmin, async (req, res) => {
    try {
      const validationResult = insertProjectSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid project data",
          errors: validationResult.error.errors
        });
      }
      
      const project = await storage.createProject(validationResult.data);
      
      return res.status(201).json({
        message: "Project created successfully",
        project
      });
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({
        message: "Failed to create project."
      });
    }
  });
  
  // Update a project (admin only)
  app.put("/api/admin/projects/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid project ID"
        });
      }
      
      const validationResult = insertProjectSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid project data",
          errors: validationResult.error.errors
        });
      }
      
      const updatedProject = await storage.updateProject(id, validationResult.data);
      
      if (!updatedProject) {
        return res.status(404).json({
          message: "Project not found"
        });
      }
      
      return res.status(200).json({
        message: "Project updated successfully",
        project: updatedProject
      });
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({
        message: "Failed to update project."
      });
    }
  });
  
  // Delete a project (admin only)
  app.delete("/api/admin/projects/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid project ID"
        });
      }
      
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({
          message: "Project not found or already deleted"
        });
      }
      
      return res.status(200).json({
        message: "Project deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      return res.status(500).json({
        message: "Failed to delete project."
      });
    }
  });
  
  // --- EXPERIENCE MANAGEMENT ---
  
  // Create a new experience (admin only)
  app.post("/api/admin/experiences", isAdmin, async (req, res) => {
    try {
      const validationResult = insertExperienceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid experience data",
          errors: validationResult.error.errors
        });
      }
      
      const experience = await storage.createExperience(validationResult.data);
      
      return res.status(201).json({
        message: "Experience created successfully",
        experience
      });
    } catch (error) {
      console.error("Error creating experience:", error);
      return res.status(500).json({
        message: "Failed to create experience."
      });
    }
  });
  
  // Update an experience (admin only)
  app.put("/api/admin/experiences/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid experience ID"
        });
      }
      
      const validationResult = insertExperienceSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid experience data",
          errors: validationResult.error.errors
        });
      }
      
      const updatedExperience = await storage.updateExperience(id, validationResult.data);
      
      if (!updatedExperience) {
        return res.status(404).json({
          message: "Experience not found"
        });
      }
      
      return res.status(200).json({
        message: "Experience updated successfully",
        experience: updatedExperience
      });
    } catch (error) {
      console.error("Error updating experience:", error);
      return res.status(500).json({
        message: "Failed to update experience."
      });
    }
  });
  
  // Delete an experience (admin only)
  app.delete("/api/admin/experiences/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid experience ID"
        });
      }
      
      const success = await storage.deleteExperience(id);
      
      if (!success) {
        return res.status(404).json({
          message: "Experience not found or already deleted"
        });
      }
      
      return res.status(200).json({
        message: "Experience deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting experience:", error);
      return res.status(500).json({
        message: "Failed to delete experience."
      });
    }
  });
  
  // --- USER MANAGEMENT ---
  
  // Change password (admin only)
  app.post("/api/admin/change-password", isAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required"
        });
      }
      
      if (!req.session.user) {
        return res.status(401).json({
          message: "Not authenticated"
        });
      }
      
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }
      
      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(401).json({
          message: "Current password is incorrect"
        });
      }
      
      // Update user with new password
      const updatedUser = {
        ...user,
        password: newPassword
      };
      
      // For a real application, you'd want to hash the password here
      await storage.createUser(updatedUser);
      
      return res.status(200).json({
        message: "Password updated successfully"
      });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({
        message: "Failed to update password."
      });
    }
  });
  
  // --- TESTIMONIAL MANAGEMENT ---
  
  // Create a new testimonial (admin only)
  app.post("/api/admin/testimonials", isAdmin, async (req, res) => {
    try {
      const validationResult = insertTestimonialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid testimonial data",
          errors: validationResult.error.errors
        });
      }
      
      // If the testimonial has an image as base64, save it
      let testimonialData = validationResult.data;
      if (testimonialData.image && testimonialData.image.startsWith('data:image')) {
        const filePath = await saveFile(testimonialData.image);
        testimonialData = {
          ...testimonialData,
          image: filePath
        };
      }
      
      const testimonial = await storage.createTestimonial(testimonialData);
      
      return res.status(201).json({
        message: "Testimonial created successfully",
        testimonial
      });
    } catch (error) {
      console.error("Error creating testimonial:", error);
      return res.status(500).json({
        message: "Failed to create testimonial."
      });
    }
  });
  
  // Update a testimonial (admin only)
  app.put("/api/admin/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid testimonial ID"
        });
      }
      
      const validationResult = insertTestimonialSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid testimonial data",
          errors: validationResult.error.errors
        });
      }
      
      // Get existing testimonial
      const existingTestimonial = await storage.getTestimonial(id);
      if (!existingTestimonial) {
        return res.status(404).json({
          message: "Testimonial not found"
        });
      }
      
      // Handle image update if provided
      let testimonialData = validationResult.data;
      if (testimonialData.image && testimonialData.image.startsWith('data:image')) {
        // Delete old image if it exists
        if (existingTestimonial.image && existingTestimonial.image.startsWith('/uploads/')) {
          await deleteFile(existingTestimonial.image);
        }
        
        const filePath = await saveFile(testimonialData.image);
        testimonialData = {
          ...testimonialData,
          image: filePath
        };
      }
      
      const updatedTestimonial = await storage.updateTestimonial(id, testimonialData);
      
      return res.status(200).json({
        message: "Testimonial updated successfully",
        testimonial: updatedTestimonial
      });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      return res.status(500).json({
        message: "Failed to update testimonial."
      });
    }
  });
  
  // Delete a testimonial (admin only)
  app.delete("/api/admin/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid testimonial ID"
        });
      }
      
      // Get the testimonial to check for image
      const testimonial = await storage.getTestimonial(id);
      if (testimonial && testimonial.image && testimonial.image.startsWith('/uploads/')) {
        await deleteFile(testimonial.image);
      }
      
      const success = await storage.deleteTestimonial(id);
      
      if (!success) {
        return res.status(404).json({
          message: "Testimonial not found or already deleted"
        });
      }
      
      return res.status(200).json({
        message: "Testimonial deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      return res.status(500).json({
        message: "Failed to delete testimonial."
      });
    }
  });
  
  // --- SOCIAL PROFILE MANAGEMENT ---
  
  // Create a new social profile (admin only)
  app.post("/api/admin/social-profiles", isAdmin, async (req, res) => {
    try {
      const validationResult = insertSocialProfileSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid social profile data",
          errors: validationResult.error.errors
        });
      }
      
      const profile = await storage.createSocialProfile(validationResult.data);
      
      return res.status(201).json({
        message: "Social profile created successfully",
        profile
      });
    } catch (error) {
      console.error("Error creating social profile:", error);
      return res.status(500).json({
        message: "Failed to create social profile."
      });
    }
  });
  
  // Update a social profile (admin only)
  app.put("/api/admin/social-profiles/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid social profile ID"
        });
      }
      
      const validationResult = insertSocialProfileSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid social profile data",
          errors: validationResult.error.errors
        });
      }
      
      const updatedProfile = await storage.updateSocialProfile(id, validationResult.data);
      
      if (!updatedProfile) {
        return res.status(404).json({
          message: "Social profile not found"
        });
      }
      
      return res.status(200).json({
        message: "Social profile updated successfully",
        profile: updatedProfile
      });
    } catch (error) {
      console.error("Error updating social profile:", error);
      return res.status(500).json({
        message: "Failed to update social profile."
      });
    }
  });
  
  // Delete a social profile (admin only)
  app.delete("/api/admin/social-profiles/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid social profile ID"
        });
      }
      
      const success = await storage.deleteSocialProfile(id);
      
      if (!success) {
        return res.status(404).json({
          message: "Social profile not found or already deleted"
        });
      }
      
      return res.status(200).json({
        message: "Social profile deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting social profile:", error);
      return res.status(500).json({
        message: "Failed to delete social profile."
      });
    }
  });
  
  // Sync a social profile (admin only)
  app.post("/api/admin/social-profiles/:id/sync", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid social profile ID"
        });
      }
      
      const profile = await storage.syncSocialProfile(id);
      
      if (!profile) {
        return res.status(404).json({
          message: "Social profile not found"
        });
      }
      
      return res.status(200).json({
        message: "Social profile synced successfully",
        profile
      });
    } catch (error) {
      console.error("Error syncing social profile:", error);
      return res.status(500).json({
        message: "Failed to sync social profile."
      });
    }
  });
  
  // --- SITE CONTENT MANAGEMENT ---
  
  // Upload a file for site content (admin only)
  app.post("/api/admin/upload", isAdmin, async (req, res) => {
    try {
      const { base64Data, filename } = req.body;
      
      if (!base64Data) {
        return res.status(400).json({
          message: "No file data provided"
        });
      }
      
      // Save the file and get the path
      const filePath = await saveFile(base64Data, filename);
      
      return res.status(200).json({
        message: "File uploaded successfully",
        filePath
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({
        message: "Failed to upload file."
      });
    }
  });
  
  // Update or create site content (admin only)
  app.post("/api/admin/content", isAdmin, async (req, res) => {
    try {
      const validationResult = insertSiteContentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid content data",
          errors: validationResult.error.errors
        });
      }
      
      // If content is image type and contains a base64 data URI, save it as a file
      if (req.body.type === 'image' && req.body.value.startsWith('data:image')) {
        const filePath = await saveFile(req.body.value);
        // Update the value to be the file path instead of base64 data
        req.body.value = filePath;
      }
      
      const content = await storage.upsertSiteContent(validationResult.data);
      
      return res.status(200).json({
        message: "Content updated successfully",
        content
      });
    } catch (error) {
      console.error("Error updating site content:", error);
      return res.status(500).json({
        message: "Failed to update site content."
      });
    }
  });
  
  // Update existing site content (admin only)
  app.patch("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid content ID"
        });
      }
      
      // Get existing content to extract section and key
      const allSections = ["hero", "about", "experience", "projects", "contact", "footer"];
      let existingContent: SiteContent | null = null;
      
      for (const section of allSections) {
        const contents = await storage.getSiteContentsBySection(section);
        const found = contents.find(content => content.id === id);
        if (found) {
          existingContent = found;
          break;
        }
      }
      
      if (!existingContent) {
        return res.status(404).json({
          message: "Content not found"
        });
      }
      
      // Determine if we need to handle a new image upload
      let newValue = req.body.value || existingContent.value;
      const contentType = req.body.type || existingContent.type;
      
      // If it's an image type and it's a data URI, we need to save the file
      if (contentType === 'image' && newValue && newValue.startsWith('data:image')) {
        // Delete the old image file if it was stored as a file
        if (existingContent.value.startsWith('/uploads/')) {
          await deleteFile(existingContent.value);
        }
        
        // Save the new image
        const filePath = await saveFile(newValue);
        newValue = filePath;
      }
      
      // Create a valid InsertSiteContent object
      const updateData: InsertSiteContent = {
        section: existingContent.section,
        key: existingContent.key,
        value: newValue,
        type: contentType
      };
      
      const validationResult = insertSiteContentSchema.safeParse(updateData);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid content data",
          errors: validationResult.error.errors
        });
      }
      
      const content = await storage.upsertSiteContent(validationResult.data);
      
      return res.status(200).json({
        message: "Content updated successfully",
        content
      });
    } catch (error) {
      console.error("Error updating site content:", error);
      return res.status(500).json({
        message: "Failed to update site content."
      });
    }
  });
  
  // Delete site content (admin only)
  app.delete("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid content ID"
        });
      }
      
      // Since we don't have a direct deleteContent method, we need to find the content
      // and then replace it with a null value
      const allSections = ["hero", "about", "experience", "projects", "contact", "footer"];
      let existingContent: SiteContent | null = null;
      
      for (const section of allSections) {
        const contents = await storage.getSiteContentsBySection(section);
        const found = contents.find(content => content.id === id);
        if (found) {
          existingContent = found;
          break;
        }
      }
      
      if (!existingContent) {
        return res.status(404).json({
          message: "Content not found"
        });
      }
      
      // If the content was an image stored as a file, delete the file
      if (existingContent.type === 'image' && existingContent.value.startsWith('/uploads/')) {
        await deleteFile(existingContent.value);
      }
      
      // Set the value to an empty string to effectively "delete" it
      await storage.upsertSiteContent({
        section: existingContent.section,
        key: existingContent.key,
        value: "", // Empty value
        type: existingContent.type
      });
      
      return res.status(200).json({
        message: "Content deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting site content:", error);
      return res.status(500).json({
        message: "Failed to delete site content."
      });
    }
  });

  // Resume builder feature has been removed

  // Chatbot endpoints have been removed

  // --- BLOG ENDPOINTS ---

  // Public blog endpoints
  
  // Get all blog posts (published only for public access)
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const filterOptions = { isPublished: true };
      const posts = await storage.getAllBlogPosts(filterOptions);
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error retrieving blog posts:", error);
      return res.status(500).json({
        message: "Failed to retrieve blog posts."
      });
    }
  });

  // Get blog post by slug
  app.get("/api/blog/posts/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({
          message: "Blog post not found"
        });
      }
      
      // Increment view count for this post
      await storage.incrementBlogPostViewCount(post.id);
      
      return res.status(200).json(post);
    } catch (error) {
      console.error("Error retrieving blog post:", error);
      return res.status(500).json({
        message: "Failed to retrieve blog post."
      });
    }
  });

  // Get blog post by ID
  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid blog post ID"
        });
      }
      
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({
          message: "Blog post not found"
        });
      }
      
      return res.status(200).json(post);
    } catch (error) {
      console.error("Error retrieving blog post:", error);
      return res.status(500).json({
        message: "Failed to retrieve blog post."
      });
    }
  });

  // Get comments for a blog post
  app.get("/api/blog/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({
          message: "Invalid blog post ID"
        });
      }
      
      const comments = await storage.getBlogCommentsByPostId(postId);
      
      // For public API, only return approved comments
      const approvedComments = comments.filter(comment => comment.isApproved);
      
      return res.status(200).json(approvedComments);
    } catch (error) {
      console.error("Error retrieving blog comments:", error);
      return res.status(500).json({
        message: "Failed to retrieve blog comments."
      });
    }
  });

  // Add a comment to a blog post
  app.post("/api/blog/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({
          message: "Invalid blog post ID"
        });
      }
      
      // Check if post exists
      const post = await storage.getBlogPost(postId);
      if (!post) {
        return res.status(404).json({
          message: "Blog post not found"
        });
      }
      
      const validationResult = insertBlogCommentSchema.safeParse({
        ...req.body,
        postId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid comment data",
          errors: validationResult.error.errors
        });
      }
      
      const comment = await storage.createBlogComment(validationResult.data);
      
      return res.status(201).json({
        message: "Comment submitted successfully and awaiting approval",
        commentId: comment.id
      });
    } catch (error) {
      console.error("Error creating blog comment:", error);
      return res.status(500).json({
        message: "Failed to submit comment."
      });
    }
  });

  // --- ADMIN BLOG MANAGEMENT ---
  
  // Get all blog posts (admin can see drafts too)
  app.get("/api/admin/blog/posts", isAdmin, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error retrieving blog posts:", error);
      return res.status(500).json({
        message: "Failed to retrieve blog posts."
      });
    }
  });

  // Create a new blog post
  app.post("/api/admin/blog/posts", isAdmin, async (req, res) => {
    try {
      const validationResult = insertBlogPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid blog post data",
          errors: validationResult.error.errors
        });
      }
      
      // Set current user as author if not specified
      const postData = validationResult.data;
      if (!postData.authorId && req.session.user) {
        postData.authorId = req.session.user.id;
      }
      
      const post = await storage.createBlogPost(postData);
      
      return res.status(201).json({
        message: "Blog post created successfully",
        post
      });
    } catch (error) {
      console.error("Error creating blog post:", error);
      return res.status(500).json({
        message: "Failed to create blog post."
      });
    }
  });

  // Update a blog post
  app.put("/api/admin/blog/posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid blog post ID"
        });
      }
      
      const validationResult = insertBlogPostSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid blog post data",
          errors: validationResult.error.errors
        });
      }
      
      const updatedPost = await storage.updateBlogPost(id, validationResult.data);
      
      if (!updatedPost) {
        return res.status(404).json({
          message: "Blog post not found"
        });
      }
      
      return res.status(200).json({
        message: "Blog post updated successfully",
        post: updatedPost
      });
    } catch (error) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({
        message: "Failed to update blog post."
      });
    }
  });

  // Delete a blog post
  app.delete("/api/admin/blog/posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid blog post ID"
        });
      }
      
      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({
          message: "Blog post not found or already deleted"
        });
      }
      
      return res.status(200).json({
        message: "Blog post deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return res.status(500).json({
        message: "Failed to delete blog post."
      });
    }
  });

  // Get all comments for admin (including unapproved)
  app.get("/api/admin/blog/comments", isAdmin, async (req, res) => {
    try {
      const postId = req.query.postId ? parseInt(req.query.postId as string) : undefined;
      
      let comments: BlogComment[] = [];
      if (postId && !isNaN(postId)) {
        comments = await storage.getBlogCommentsByPostId(postId);
      } else {
        // Get all comments from all posts
        const posts = await storage.getAllBlogPosts();
        for (const post of posts) {
          const postComments = await storage.getBlogCommentsByPostId(post.id);
          comments = [...comments, ...postComments];
        }
      }
      
      return res.status(200).json(comments);
    } catch (error) {
      console.error("Error retrieving blog comments:", error);
      return res.status(500).json({
        message: "Failed to retrieve blog comments."
      });
    }
  });

  // Approve or disapprove a comment
  app.put("/api/admin/blog/comments/:id/approval", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid comment ID"
        });
      }
      
      const { isApproved } = req.body;
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({
          message: "isApproved must be a boolean value"
        });
      }
      
      const updatedComment = await storage.updateBlogCommentApproval(id, isApproved);
      
      if (!updatedComment) {
        return res.status(404).json({
          message: "Comment not found"
        });
      }
      
      return res.status(200).json({
        message: `Comment ${isApproved ? 'approved' : 'disapproved'} successfully`,
        comment: updatedComment
      });
    } catch (error) {
      console.error("Error updating comment approval status:", error);
      return res.status(500).json({
        message: "Failed to update comment approval status."
      });
    }
  });

  // Delete a comment
  app.delete("/api/admin/blog/comments/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: "Invalid comment ID"
        });
      }
      
      const success = await storage.deleteBlogComment(id);
      
      if (!success) {
        return res.status(404).json({
          message: "Comment not found or already deleted"
        });
      }
      
      return res.status(200).json({
        message: "Comment deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({
        message: "Failed to delete comment."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
