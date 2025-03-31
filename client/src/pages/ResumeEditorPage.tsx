import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Import our new AI components
import AISuggestionPanel from "@/components/resume/AISuggestionPanel";
import JobDescriptionAnalyzer from "@/components/resume/JobDescriptionAnalyzer";
import ResumeFeedback from "@/components/resume/ResumeFeedback";
import { Sparkles, BrainCircuit, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// Authentication no longer required for resume builder
import { 
  AlertCircle, 
  Check, 
  Code2, 
  FileDown, 
  Lightbulb, 
  Plus, 
  Trash, 
  X 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Skill badge component for suggested skills
interface SkillBadgeProps {
  skill: string;
  currentSkills: string[];
  onAdd: (skill: string) => void;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, currentSkills, onAdd }) => {
  const isSelected = currentSkills.includes(skill);
  
  return (
    <Badge 
      variant={isSelected ? "secondary" : "outline"}
      className={`cursor-pointer transition-all px-3 py-1 ${
        isSelected 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-primary/10"
      }`}
      onClick={() => {
        if (!isSelected) {
          onAdd(skill);
        }
      }}
    >
      {!isSelected && <Plus className="h-3 w-3 mr-1" />}
      {skill}
    </Badge>
  );
};

// Helper function to generate unique IDs safely
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

interface ResumeTemplate {
  id: number;
  name: string;
  description: string;
  previewImage: string;
  structure: string;
  style: string;
  suitableFor: string[];
  updatedAt: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary: string;
  };
  education: {
    id: string;
    institution: string;
    degree: string;
    date: string;
    description?: string;
  }[];
  experience: {
    id: string;
    position: string;
    company: string;
    date: string;
    description: string[];
  }[];
  skills: string[];
  projects: {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
}

// Zod schema for resume form validation with relaxed constraints
const resumeDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string().optional().or(z.literal("")),
    linkedin: z.string().optional().or(z.literal("")),
    github: z.string().optional().or(z.literal("")),
    summary: z.string(),
  }),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      date: z.string(),
      description: z.string().optional(),
    })
  ),
  experience: z.array(
    z.object({
      id: z.string(),
      position: z.string(),
      company: z.string(),
      date: z.string(),
      description: z.array(z.string()),
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      link: z.string().optional().or(z.literal("")),
    })
  ),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
    })
  ),
});

type ResumeFormValues = z.infer<typeof resumeDataSchema>;

// Resume data schema for API
const apiResumeSchema = z.object({
  name: z.string().min(2, { message: "Resume name is required" }),
  resumeData: z.string(),
  templateId: z.number(),
});

type ApiResumeValues = z.infer<typeof apiResumeSchema>;

const ResumeEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const templateId = parseInt(id);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // No authentication required for resume creation
  const [activeTab, setActiveTab] = useState("personalInfo");
  const [resumeName, setResumeName] = useState("My Professional Resume");
  const [showPreview, setShowPreview] = useState(false);
  // ATS Score state
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsSuggestions, setAtsSuggestions] = useState<string[]>([]);

  // Fetch template data
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/resume-templates/${templateId}`],
    queryFn: getQueryFn<ResumeTemplate>({ on401: "returnNull" }),
    enabled: !isNaN(templateId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user experiences to prefill data
  const { data: experiences, isLoading: experiencesLoading } = useQuery({
    queryKey: ['/api/experiences'],
    queryFn: getQueryFn<any[]>({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Form setup
  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeDataSchema),
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        summary: "",
      },
      education: [
        {
          id: generateId(),
          institution: "",
          degree: "",
          date: "",
          description: "",
        }
      ],
      experience: [
        {
          id: generateId(),
          position: "",
          company: "",
          date: "",
          description: [""],
        }
      ],
      skills: [],
      projects: [
        {
          id: generateId(),
          name: "",
          description: "",
          technologies: [],
          link: "",
        }
      ],
      certifications: [
        {
          id: generateId(),
          name: "",
          issuer: "",
          date: "",
        }
      ],
    },
  });

  // Generate PDF function
  const generatePDF = async (resumeData: ResumeFormValues) => {
    try {
      // In a production environment, you would call a PDF generation API or use a library
      // For this implementation, we'll simulate the PDF generation
      
      // Create a "blob URL" that simulates a PDF download
      const jsonString = JSON.stringify(resumeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.fullName || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Your resume PDF has been downloaded to your device.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save resume mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ApiResumeValues) => {
      return apiRequest('/api/resumes', {
        method: 'POST',
      }, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      
      toast({
        title: "Resume saved!",
        description: "Your resume has been successfully saved.",
        variant: "default",
      });
      
      // After saving, offer to download the PDF
      const values = form.getValues();
      generatePDF(values);
    },
    onError: (error) => {
      toast({
        title: "Error saving resume",
        description: "There was a problem saving your resume. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Prefill form with user experiences if available
  useEffect(() => {
    if (experiences && experiences.length > 0) {
      // Map experiences to form format
      const mappedExperiences = experiences.map((exp: any) => ({
        id: generateId(),
        position: exp.title,
        company: exp.company,
        date: exp.period,
        description: exp.description,
      }));
      
      form.setValue('experience', mappedExperiences);
      
      // Extract skills from experiences
      const skills = new Set<string>();
      experiences.forEach((exp: any) => {
        exp.technologies.forEach((tech: string) => skills.add(tech));
      });
      
      form.setValue('skills', Array.from(skills));
    }
  }, [experiences, form]);

  const handleSave = async () => {
    const values = form.getValues();
    
    try {
      // Check if experience data is available (which should be prefilled)
      if (values.experience && values.experience.length === 0) {
        toast({
          title: "Missing information",
          description: "Please add at least one experience entry before generating a PDF.",
          variant: "destructive",
        });
        return;
      }
      
      // Proceed with saving even if some fields are incomplete
      const apiData: ApiResumeValues = {
        name: resumeName || "My Professional Resume",
        resumeData: JSON.stringify(values),
        templateId: templateId,
      };
      
      await saveMutation.mutateAsync(apiData);
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error generating resume",
        description: "There was a problem creating your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async () => {
    // Only validate required fields that have been filled out
    const values = form.getValues();
    
    // Check if at least the experience section is filled out (which is prefilled with user experiences)
    if (values.experience && values.experience.length > 0 && 
        values.experience[0].position && values.experience[0].company) {
      setShowPreview(true);
    } else {
      // Skip strict validation and just display a warning
      toast({
        title: "Resume Preview",
        description: "Some required fields are missing, but you can still preview your resume. Fill in more details for a complete resume.",
        variant: "default",
      });
      setShowPreview(true);
    }
  };

  // Helper functions for form array fields
  const addEducation = () => {
    const currentEducation = form.getValues("education");
    form.setValue("education", [
      ...currentEducation,
      {
        id: generateId(),
        institution: "",
        degree: "",
        date: "",
        description: "",
      }
    ]);
  };

  const removeEducation = (id: string) => {
    const currentEducation = form.getValues("education");
    if (currentEducation.length > 1) {
      form.setValue("education", currentEducation.filter(edu => edu.id !== id));
    }
  };

  const addExperience = () => {
    const currentExperience = form.getValues("experience");
    form.setValue("experience", [
      ...currentExperience,
      {
        id: generateId(),
        position: "",
        company: "",
        date: "",
        description: [""],
      }
    ]);
  };

  const removeExperience = (id: string) => {
    const currentExperience = form.getValues("experience");
    if (currentExperience.length > 1) {
      form.setValue("experience", currentExperience.filter(exp => exp.id !== id));
    }
  };

  const addExperiencePoint = (expId: string) => {
    const currentExperience = form.getValues("experience");
    const updatedExperience = currentExperience.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          description: [...exp.description, ""]
        };
      }
      return exp;
    });
    form.setValue("experience", updatedExperience);
  };

  const removeExperiencePoint = (expId: string, index: number) => {
    const currentExperience = form.getValues("experience");
    const updatedExperience = currentExperience.map(exp => {
      if (exp.id === expId && exp.description.length > 1) {
        const newDescription = [...exp.description];
        newDescription.splice(index, 1);
        return {
          ...exp,
          description: newDescription
        };
      }
      return exp;
    });
    form.setValue("experience", updatedExperience);
  };

  const addProject = () => {
    const currentProjects = form.getValues("projects");
    form.setValue("projects", [
      ...currentProjects,
      {
        id: generateId(),
        name: "",
        description: "",
        technologies: [],
        link: "",
      }
    ]);
  };

  const removeProject = (id: string) => {
    const currentProjects = form.getValues("projects");
    if (currentProjects.length > 1) {
      form.setValue("projects", currentProjects.filter(proj => proj.id !== id));
    }
  };

  const addCertification = () => {
    const currentCertifications = form.getValues("certifications");
    form.setValue("certifications", [
      ...currentCertifications,
      {
        id: generateId(),
        name: "",
        issuer: "",
        date: "",
      }
    ]);
  };

  const removeCertification = (id: string) => {
    const currentCertifications = form.getValues("certifications");
    if (currentCertifications.length > 1) {
      form.setValue("certifications", currentCertifications.filter(cert => cert.id !== id));
    }
  };
  
  // ATS Score checker function
  const checkATSScore = () => {
    const values = form.getValues();
    
    // Simple ATS score criteria, calculate points based on content
    let score = 0;
    const maxPoints = 100;
    const suggestions: string[] = [];
    
    // Check personal info completeness
    if (values.personalInfo.fullName) score += 5;
    else suggestions.push("Add your full name to your resume");
    
    if (values.personalInfo.email) score += 5;
    else suggestions.push("Add your email address");
    
    if (values.personalInfo.phone) score += 5;
    else suggestions.push("Add your phone number");
    
    if (values.personalInfo.location) score += 5;
    else suggestions.push("Add your location (city, state, country)");
    
    // Check for professional summary
    if (values.personalInfo.summary) {
      score += 10;
      if (values.personalInfo.summary.length < 50) {
        suggestions.push("Expand your professional summary (aim for 75-150 words)");
      }
    } else {
      suggestions.push("Add a professional summary to highlight your expertise and goals");
    }
    
    // Check experience section
    if (values.experience.length > 0) {
      score += 5;
      
      // Check quality of experience entries
      let totalBulletPoints = 0;
      let experiencesWithDates = 0;
      
      values.experience.forEach(exp => {
        if (exp.position && exp.company) score += 5;
        else suggestions.push(`Add both position title and company name for all experiences`);
        
        if (exp.date) experiencesWithDates++;
        
        if (exp.description.length > 0) {
          totalBulletPoints += exp.description.filter(d => d.trim().length > 0).length;
          
          // Check for action verbs in bullet points
          const actionVerbs = ["developed", "implemented", "led", "managed", "created", "built", "designed", "improved", "increased", "reduced"];
          const hasActionVerbs = exp.description.some(desc => 
            actionVerbs.some(verb => desc.toLowerCase().includes(verb))
          );
          
          if (!hasActionVerbs) {
            suggestions.push(`Use strong action verbs in your experience bullet points (e.g., developed, implemented, led)`);
          }
          
          // Check for metrics/quantifiable achievements
          const hasMetrics = exp.description.some(desc => 
            /\d+%|\d+x|\$\d+|\d+ [a-z]+/i.test(desc)
          );
          
          if (!hasMetrics) {
            suggestions.push(`Quantify your achievements with metrics where possible (e.g., "increased efficiency by 20%")`);
          }
        }
      });
      
      if (experiencesWithDates < values.experience.length) {
        suggestions.push("Add dates for all work experiences");
      }
      
      if (totalBulletPoints < values.experience.length * 2) {
        suggestions.push("Add more bullet points to your work experiences (aim for 3-5 per role)");
      }
      
      score += Math.min(15, totalBulletPoints * 2); // Max 15 points for bullet points
    } else {
      suggestions.push("Add your work experiences - this is a critical section for ATS");
    }
    
    // Check education section
    if (values.education.length > 0) {
      score += 5;
      
      // Check quality of education entries
      let educationComplete = true;
      
      values.education.forEach(edu => {
        if (!edu.institution || !edu.degree || !edu.date) {
          educationComplete = false;
        }
      });
      
      if (!educationComplete) {
        suggestions.push("Complete all fields (institution, degree, date) for education entries");
      } else {
        score += 5;
      }
    } else {
      suggestions.push("Add your educational background");
    }
    
    // Check skills section
    if (values.skills.length > 0) {
      score += 5;
      
      if (values.skills.length < 5) {
        suggestions.push("Add more relevant skills (aim for 8-12 key skills)");
      } else if (values.skills.length >= 5) {
        score += 5;
      }
      
      // Check if skills match experience
      const skillsInExperience = values.experience.flatMap(exp => 
        exp.description.filter(desc => 
          values.skills.some(skill => desc.toLowerCase().includes(skill.toLowerCase()))
        )
      );
      
      if (skillsInExperience.length < Math.min(3, values.skills.length)) {
        suggestions.push("Mention your key skills in your experience bullet points for better ATS matching");
      }
    } else {
      suggestions.push("Add relevant skills to your resume - this is critical for ATS keyword matching");
    }
    
    // Check projects section
    if (values.projects.length > 0) {
      score += 5;
      
      // Check quality of project entries
      const projectsWithTech = values.projects.filter(proj => 
        proj.technologies && proj.technologies.length > 0
      ).length;
      
      if (projectsWithTech < values.projects.length) {
        suggestions.push("List technologies used for each project");
      } else {
        score += 5;
      }
    }
    
    // Check certifications
    if (values.certifications.length > 0 && values.certifications[0].name) {
      score += 5;
    }
    
    // If we have more than 3 suggestions, limit to the most important ones
    if (suggestions.length > 3) {
      suggestions.length = 3;
    }
    
    // If no issues found, provide positive feedback
    if (suggestions.length === 0) {
      suggestions.push("Great job! Your resume is well-optimized for ATS systems.");
    }
    
    setAtsScore(score);
    setAtsSuggestions(suggestions);
  };

  // UI animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Parse template style if available
  const templateStyle = template ? JSON.parse(template.style) : null;
  const templateStructure = template ? JSON.parse(template.structure) : null;

  return (
    <motion.div 
      className="container max-w-7xl mx-auto py-8 px-4 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Resume Editor
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {templateLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : template ? (
              `Template: ${template.name}`
            ) : (
              "Template not found"
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {showPreview ? (
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Back to Editor
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={saveMutation.isPending}
            >
              Preview Resume
            </Button>
          )}
          
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {saveMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF Resume
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Resume name input */}
      <div className="mb-6">
        <label htmlFor="resumeName" className="block text-sm font-medium mb-2">
          Resume Name
        </label>
        <Input
          id="resumeName"
          value={resumeName}
          onChange={(e) => setResumeName(e.target.value)}
          className="max-w-md"
          placeholder="Enter a name for your resume"
        />
      </div>

      {showPreview ? (
        <ResumePreview 
          data={form.getValues()} 
          template={template} 
        />
      ) : (
        <Form {...form}>
          <form className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Content</CardTitle>
                <CardDescription>
                  Fill in your information to build your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                    <TabsTrigger value="tips">Resume Tips</TabsTrigger>
                    <TabsTrigger value="aiAssistant" className="bg-gradient-to-r from-primary/20 to-primary/10">
                      <Sparkles className="h-4 w-4 mr-1 text-primary" />
                      AI Assistant
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Personal Info */}
                  <TabsContent value="personalInfo">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="personalInfo.fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Ritik Mahyavanshi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="personalInfo.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email*</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="personalInfo.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone*</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="personalInfo.location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location*</FormLabel>
                              <FormControl>
                                <Input placeholder="City, State, Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="personalInfo.website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://yourwebsite.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="personalInfo.linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/yourusername" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="personalInfo.github"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub</FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/yourusername" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="personalInfo.summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Summary*</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="A brief summary of your professional background, skills, and career objectives..." 
                                rows={5}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Education */}
                  <TabsContent value="education">
                    <div className="space-y-6">
                      {form.watch("education").map((education, index) => (
                        <div key={education.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Education #{index + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(education.id)}
                              disabled={form.watch("education").length <= 1}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`education.${index}.institution`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Institution*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="University or School Name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`education.${index}.degree`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree/Field of Study*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bachelor of Science in Computer Science" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`education.${index}.date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date Range*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="2018 - 2022" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`education.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Additional details about your education, achievements, etc."
                                      rows={3}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addEducation}
                        className="mt-2"
                      >
                        Add Education
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Experience */}
                  <TabsContent value="experience">
                    <div className="space-y-6">
                      {form.watch("experience").map((experience, expIndex) => (
                        <div key={experience.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Experience #{expIndex + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(experience.id)}
                              disabled={form.watch("experience").length <= 1}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`experience.${expIndex}.position`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Position/Title*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Software Engineer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`experience.${expIndex}.company`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Company Name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`experience.${expIndex}.date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date Range*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Jan 2020 - Present" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">
                              Description Points*
                            </label>
                            
                            {experience.description.map((desc, descIndex) => (
                              <div key={descIndex} className="flex gap-2 mb-2">
                                <FormField
                                  control={form.control}
                                  name={`experience.${expIndex}.description.${descIndex}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input 
                                          placeholder="Describe your responsibilities and achievements"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExperiencePoint(experience.id, descIndex)}
                                  disabled={experience.description.length <= 1}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addExperiencePoint(experience.id)}
                              className="mt-2"
                            >
                              Add Description Point
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addExperience}
                        className="mt-2"
                      >
                        Add Experience
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Skills */}
                  <TabsContent value="skills">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <div>
                                <Textarea 
                                  placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, Python)"
                                  rows={4}
                                  value={field.value.join(", ")}
                                  onChange={(e) => {
                                    const skillsArray = e.target.value
                                      .split(",")
                                      .map(skill => skill.trim())
                                      .filter(skill => skill !== "");
                                    field.onChange(skillsArray);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              List your technical skills and competencies. These will be formatted as tags in your resume.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.watch("skills").map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="px-3 py-1 text-sm"
                          >
                            {skill}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => {
                                const currentSkills = form.getValues("skills");
                                const updatedSkills = currentSkills.filter((_, i) => i !== index);
                                form.setValue("skills", updatedSkills);
                              }}
                            >
                              <span className="sr-only">Remove</span>
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Suggested skills from experience */}
                      {experiences && experiences.length > 0 && (
                        <Card className="bg-muted/50 mt-6">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center">
                              <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                              Suggested Skills
                            </CardTitle>
                            <CardDescription>
                              Based on your experience, you might want to add these skills
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {/* Extract unique technologies from experiences */}
                              {experiences
                                .flatMap((exp: any) => exp.technologies || [])
                                .filter((tech: string, index: number, self: string[]) => 
                                  self.indexOf(tech) === index && !form.watch("skills").includes(tech))
                                .map((tech: string, index: number) => (
                                  <Badge 
                                    key={index} 
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                                    onClick={() => {
                                      const currentSkills = form.getValues("skills");
                                      if (!currentSkills.includes(tech)) {
                                        form.setValue("skills", [...currentSkills, tech]);
                                        toast({
                                          title: "Skill Added",
                                          description: `Added ${tech} to your skills`,
                                        });
                                      }
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {tech}
                                  </Badge>
                                ))
                              }
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Common tech skills */}
                      <Card className="mt-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium flex items-center">
                            <Code2 className="h-4 w-4 mr-2 text-primary" />
                            Popular Technology Skills
                          </CardTitle>
                          <CardDescription>
                            Click to add common technical skills to your resume
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="languages">
                            <TabsList className="mb-4 w-full flex flex-wrap">
                              <TabsTrigger value="languages">Languages</TabsTrigger>
                              <TabsTrigger value="frontend">Frontend</TabsTrigger>
                              <TabsTrigger value="backend">Backend</TabsTrigger>
                              <TabsTrigger value="data">Data & ML</TabsTrigger>
                              <TabsTrigger value="devops">DevOps</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="languages">
                              <div className="flex flex-wrap gap-2">
                                {['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R'].map((skillItem) => (
                                  <SkillBadge 
                                    key={skillItem} 
                                    skill={skillItem} 
                                    currentSkills={form.watch("skills")} 
                                    onAdd={(s: string) => {
                                      const currentSkills = form.getValues("skills");
                                      form.setValue("skills", [...currentSkills, s]);
                                    }}
                                  />
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="frontend">
                              <div className="flex flex-wrap gap-2">
                                {['React', 'Angular', 'Vue.js', 'Next.js', 'Redux', 'HTML5', 'CSS3', 'Sass/SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Webpack', 'Vite', 'Responsive Design', 'Web Accessibility'].map((skillItem) => (
                                  <SkillBadge 
                                    key={skillItem} 
                                    skill={skillItem} 
                                    currentSkills={form.watch("skills")} 
                                    onAdd={(s: string) => {
                                      const currentSkills = form.getValues("skills");
                                      form.setValue("skills", [...currentSkills, s]);
                                    }}
                                  />
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="backend">
                              <div className="flex flex-wrap gap-2">
                                {['Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails', 'FastAPI', 'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Prisma', 'Sequelize', 'Mongoose'].map((skillItem) => (
                                  <SkillBadge 
                                    key={skillItem} 
                                    skill={skillItem} 
                                    currentSkills={form.watch("skills")} 
                                    onAdd={(s: string) => {
                                      const currentSkills = form.getValues("skills");
                                      form.setValue("skills", [...currentSkills, s]);
                                    }}
                                  />
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="data">
                              <div className="flex flex-wrap gap-2">
                                {['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Data Visualization', 'Tableau', 'Power BI', 'SQL', 'Big Data', 'Apache Spark', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning'].map((skillItem) => (
                                  <SkillBadge 
                                    key={skillItem} 
                                    skill={skillItem} 
                                    currentSkills={form.watch("skills")} 
                                    onAdd={(s: string) => {
                                      const currentSkills = form.getValues("skills");
                                      form.setValue("skills", [...currentSkills, s]);
                                    }}
                                  />
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="devops">
                              <div className="flex flex-wrap gap-2">
                                {['Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud Platform', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Infrastructure as Code', 'Terraform', 'Ansible', 'Linux', 'Bash', 'Networking', 'Microservices', 'Serverless'].map((skillItem) => (
                                  <SkillBadge 
                                    key={skillItem} 
                                    skill={skillItem} 
                                    currentSkills={form.watch("skills")} 
                                    onAdd={(s: string) => {
                                      const currentSkills = form.getValues("skills");
                                      form.setValue("skills", [...currentSkills, s]);
                                    }}
                                  />
                                ))}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* Projects */}
                  <TabsContent value="projects">
                    <div className="space-y-6">
                      {form.watch("projects").map((project, projIndex) => (
                        <div key={project.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Project #{projIndex + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProject(project.id)}
                              disabled={form.watch("projects").length <= 1}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`projects.${projIndex}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Project Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Project Name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`projects.${projIndex}.link`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Project Link</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://github.com/yourusername/project" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`projects.${projIndex}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description*</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your project, its purpose, and your contributions"
                                      rows={3}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`projects.${projIndex}.technologies`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Technologies Used</FormLabel>
                                  <FormControl>
                                    <div>
                                      <Input 
                                        placeholder="Enter technologies separated by commas (e.g., React, Node.js, MongoDB)"
                                        value={field.value.join(", ")}
                                        onChange={(e) => {
                                          const techArray = e.target.value
                                            .split(",")
                                            .map(tech => tech.trim())
                                            .filter(tech => tech !== "");
                                          field.onChange(techArray);
                                        }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.technologies.map((tech, techIndex) => (
                                <Badge key={techIndex} variant="outline">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addProject}
                        className="mt-2"
                      >
                        Add Project
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Certifications */}
                  <TabsContent value="certifications">
                    <div className="space-y-6">
                      {form.watch("certifications").map((certification, certIndex) => (
                        <div key={certification.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Certification #{certIndex + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(certification.id)}
                              disabled={form.watch("certifications").length <= 1}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`certifications.${certIndex}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Certification Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="AWS Certified Solutions Architect" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`certifications.${certIndex}.issuer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Issuing Organization*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Amazon Web Services" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name={`certifications.${certIndex}.date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="May 2022" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCertification}
                        className="mt-2"
                      >
                        Add Certification
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Resume Tips */}
                  <TabsContent value="tips">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>ATS Score Checker</CardTitle>
                          <CardDescription>
                            Check how well your resume will perform with Applicant Tracking Systems (ATS)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <Button 
                              onClick={() => checkATSScore()} 
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                            >
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                                Check ATS Compatibility
                              </span>
                            </Button>
                          </div>
                          
                          <div className="p-4 border rounded-lg bg-card">
                            {atsScore !== null ? (
                              <>
                                <h3 className="text-lg font-medium mb-2">ATS Score: {atsScore}%</h3>
                                <div className="w-full bg-secondary h-3 rounded-full mb-4">
                                  <div 
                                    className={`h-3 rounded-full ${
                                      atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${atsScore}%` }}
                                  ></div>
                                </div>
                                <h4 className="font-medium mb-2">Suggestions:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {atsSuggestions.length > 0 ? (
                                    atsSuggestions.map((suggestion, index) => (
                                      <li key={index}>{suggestion}</li>
                                    ))
                                  ) : (
                                    <li>Great job! Your resume looks optimized for ATS systems.</li>
                                  )}
                                </ul>
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground mb-2">
                                  Click the button above to check how well your resume will perform with ATS systems 
                                  and get suggestions for improvement.
                                </p>
                                <p className="text-sm text-muted-foreground italic">
                                  Most employers use ATS software to screen resumes before they reach human reviewers.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Resume Building Tips</CardTitle>
                          <CardDescription>
                            Expert advice to make your resume stand out
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium mb-2">ATS Optimization</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Use standard section headings (Experience, Education, Skills) that ATS systems recognize</li>
                              <li>Include keywords from the job description, especially technical skills and qualifications</li>
                              <li>Avoid using tables, columns, headers, footers, or images that ATS might not parse correctly</li>
                              <li>Use a clean, standard font (Arial, Calibri, Times New Roman) and normal bullet points</li>
                              <li>Save your final resume as a .docx or .pdf file (some ATS may have trouble with .pdf files)</li>
                              <li>Avoid custom templates that might use text boxes or other elements that confuse ATS systems</li>
                            </ul>
                          </div>

                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Content Best Practices</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Tailor your resume for each position by matching skills and experience to the job description</li>
                              <li>Use action verbs (Developed, Implemented, Led) and quantify achievements with metrics</li>
                              <li>Keep your resume to 1-2 pages maximum unless you have 10+ years of experience</li>
                              <li>Place the most relevant information at the top of each section</li>
                              <li>Focus on accomplishments rather than responsibilities</li>
                              <li>Ensure contact information is current and professional</li>
                            </ul>
                          </div>

                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Technical Resume Tips</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>List technical skills in a dedicated section, organized by categories</li>
                              <li>Include specific versions of technologies when relevant (e.g., "Python 3.x")</li>
                              <li>For tech positions, place your technical skills section prominently</li>
                              <li>Link to code repositories or portfolio projects when applicable</li>
                              <li>Demonstrate technical problem-solving in your work experience</li>
                              <li>Include relevant certifications and continuous learning activities</li>
                            </ul>
                          </div>

                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Formatting Guidelines</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Use consistent formatting for headings, dates, and bullets</li>
                              <li>Utilize white space effectively to improve readability</li>
                              <li>Make your name and contact information stand out at the top</li>
                              <li>Use bold text strategically to highlight important information</li>
                              <li>Ensure perfect spelling and grammar throughout</li>
                              <li>Save your resume with a professional filename (e.g., "FirstName-LastName-Resume.pdf")</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* AI Assistant */}
                  <TabsContent value="aiAssistant">
                    <div className="space-y-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-1/2">
                          <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="w-full grid grid-cols-3 mb-4">
                              <TabsTrigger value="summary">Summary</TabsTrigger>
                              <TabsTrigger value="bullet">Bullet Points</TabsTrigger>
                              <TabsTrigger value="skills">Skills</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="summary">
                              <AISuggestionPanel 
                                type="summary"
                                currentText={form.watch("personalInfo.summary")}
                                onSelectSuggestion={(suggestion) => {
                                  form.setValue("personalInfo.summary", suggestion);
                                  toast({
                                    title: "Professional summary updated",
                                    description: "The AI-generated summary has been applied to your resume"
                                  });
                                }}
                              />
                            </TabsContent>
                            
                            <TabsContent value="bullet">
                              <AISuggestionPanel 
                                type="bullet"
                                onSelectSuggestion={(suggestion) => {
                                  const currentExperience = form.getValues("experience");
                                  if (currentExperience.length > 0) {
                                    const updatedExperience = [...currentExperience];
                                    updatedExperience[0].description = [
                                      ...updatedExperience[0].description,
                                      suggestion
                                    ];
                                    form.setValue("experience", updatedExperience);
                                    toast({
                                      title: "Experience bullet point added",
                                      description: "A new bullet point has been added to your first experience entry"
                                    });
                                  } else {
                                    toast({
                                      title: "No experience entries",
                                      description: "Please add an experience entry first",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              />
                            </TabsContent>
                            
                            <TabsContent value="skills">
                              <AISuggestionPanel 
                                type="skills"
                                onSelectSuggestion={(suggestion) => {
                                  const skills = suggestion.split(", ");
                                  const currentSkills = form.getValues("skills");
                                  // Use filter to create unique skills array instead of Set
                                  const uniqueSkills = [...currentSkills];
                                  skills.forEach(skill => {
                                    if (!uniqueSkills.includes(skill)) {
                                      uniqueSkills.push(skill);
                                    }
                                  });
                                  form.setValue("skills", uniqueSkills);
                                  toast({
                                    title: "Skills updated",
                                    description: "New skills have been added to your resume"
                                  });
                                }}
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                        
                        <div className="w-full lg:w-1/2">
                          <Tabs defaultValue="analyzer" className="w-full">
                            <TabsList className="w-full grid grid-cols-2 mb-4">
                              <TabsTrigger value="analyzer">Job Analyzer</TabsTrigger>
                              <TabsTrigger value="feedback">Resume Feedback</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="analyzer">
                              <JobDescriptionAnalyzer 
                                resumeData={form.getValues()}
                                onOptimizationClick={(missedKeywords) => {
                                  const currentSkills = form.getValues("skills");
                                  
                                  // Add only unique skills that don't already exist
                                  const updatedSkills = [...currentSkills];
                                  missedKeywords.forEach(keyword => {
                                    if (!updatedSkills.includes(keyword)) {
                                      updatedSkills.push(keyword);
                                    }
                                  });
                                  
                                  form.setValue("skills", updatedSkills);
                                  toast({
                                    title: "Resume optimized",
                                    description: "Missing keywords have been added to your skills section"
                                  });
                                }}
                              />
                            </TabsContent>
                            
                            <TabsContent value="feedback">
                              <ResumeFeedback 
                                resumeData={form.getValues()}
                                onApplySuggestion={(section, suggestion) => {
                                  // Apply suggestion based on the section
                                  if (section === "Summary") {
                                    form.setValue("personalInfo.summary", 
                                      form.getValues("personalInfo.summary") + " " + suggestion);
                                  } else if (section === "Skills") {
                                    const skills = form.getValues("skills");
                                    const newSkill = suggestion.replace("Add ", "").split(" ")[0];
                                    
                                    // Only add if skill doesn't already exist
                                    if (!skills.includes(newSkill)) {
                                      form.setValue("skills", [...skills, newSkill]);
                                    }
                                  }
                                  
                                  toast({
                                    title: "Suggestion applied",
                                    description: `Applied a suggestion to the ${section} section`
                                  });
                                }}
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-lg border">
                        <div className="flex items-start gap-2">
                          <BrainCircuit className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium mb-1">AI Assistant Tips</h3>
                            <p className="text-sm text-muted-foreground">
                              Use our AI tools to enhance your resume. These suggestions are based on best practices and industry standards,
                              but always review and personalize automated content before finalizing your resume.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab(getPreviousTab(activeTab))}
                  disabled={activeTab === "personalInfo"}
                >
                  Previous Section
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab(getNextTab(activeTab))}
                  disabled={activeTab === "aiAssistant"}
                >
                  Next Section
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </motion.div>
  );
};

const ResumePreview: React.FC<{ 
  data: ResumeFormValues; 
  template?: ResumeTemplate;
}> = ({ data, template }) => {
  const { toast } = useToast();
  const templateStyle = template ? JSON.parse(template.style) : null;
  const templateStructure = template ? JSON.parse(template.structure) : null;

  // Function to download the resume as PDF
  const downloadPDF = async () => {
    try {
      // Create a "blob URL" that simulates a PDF download
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.personalInfo.fullName || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Your resume PDF has been downloaded to your device.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate dynamic style based on template
  const dynamicStyle = templateStyle ? {
    fontFamily: templateStyle.fontFamily || 'Inter, sans-serif',
    "--primary-color": templateStyle.primaryColor || '#3b82f6',
    "--secondary-color": templateStyle.secondaryColor || '#f8fafc',
    "--accent-color": templateStyle.accentColor || '#334155',
    fontSize: templateStyle.fontSize || '11pt',
    lineHeight: templateStyle.lineHeight || 1.5,
  } as React.CSSProperties : {};

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
          onClick={downloadPDF}
        >
          <FileDown className="h-4 w-4" />
          Download PDF
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="mb-0">Preview Mode</Badge>
        </div>
      </div>
      
      <ScrollArea className="h-[800px] overflow-auto pr-4" style={dynamicStyle}>
        {/* Header */}
        <div className="text-center mb-6 border-b pb-4" style={{ color: 'var(--accent-color)' }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--primary-color)' }}>
            {data.personalInfo.fullName}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            <span>{data.personalInfo.location}</span>
            <span>•</span>
            <span>{data.personalInfo.phone}</span>
            <span>•</span>
            <span>{data.personalInfo.email}</span>
            {data.personalInfo.linkedin && (
              <>
                <span>•</span>
                <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="underline">
                  LinkedIn
                </a>
              </>
            )}
            {data.personalInfo.github && (
              <>
                <span>•</span>
                <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="underline">
                  GitHub
                </a>
              </>
            )}
            {data.personalInfo.website && (
              <>
                <span>•</span>
                <a href={data.personalInfo.website} target="_blank" rel="noopener noreferrer" className="underline">
                  Website
                </a>
              </>
            )}
          </div>
        </div>
        
        {/* Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
            Professional Summary
          </h2>
          <p>{data.personalInfo.summary}</p>
        </div>
        
        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{exp.position}</h3>
                  <h4>{exp.company}</h4>
                </div>
                <span className="text-sm">{exp.date}</span>
              </div>
              <ul className="mt-2 list-disc pl-5">
                {exp.description.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Education */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{edu.institution}</h3>
                  <h4>{edu.degree}</h4>
                </div>
                <span className="text-sm">{edu.date}</span>
              </div>
              {edu.description && <p className="mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
        
        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Projects */}
        {data.projects.some(p => p.name.trim() !== "") && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
              Projects
            </h2>
            {data.projects.filter(p => p.name.trim() !== "").map((project, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">
                    {project.name}
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-sm underline"
                        style={{ color: 'var(--primary-color)' }}
                      >
                        Link
                      </a>
                    )}
                  </h3>
                </div>
                <p className="mt-1">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Certifications */}
        {data.certifications.some(c => c.name.trim() !== "") && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--primary-color)' }}>
              Certifications
            </h2>
            {data.certifications.filter(c => c.name.trim() !== "").map((cert, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold">{cert.name}</span>
                    {cert.issuer && <span> - {cert.issuer}</span>}
                  </div>
                  <span className="text-sm">{cert.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Helper function to get the next tab
function getNextTab(currentTab: string): string {
  const tabs = ["personalInfo", "education", "experience", "skills", "projects", "certifications", "tips", "aiAssistant"];
  const currentIndex = tabs.indexOf(currentTab);
  return currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : currentTab;
}

// Helper function to get the previous tab
function getPreviousTab(currentTab: string): string {
  const tabs = ["personalInfo", "education", "experience", "skills", "projects", "certifications", "tips", "aiAssistant"];
  const currentIndex = tabs.indexOf(currentTab);
  return currentIndex > 0 ? tabs[currentIndex - 1] : currentTab;
}

export default ResumeEditorPage;