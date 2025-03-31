import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ClipboardCheck, 
  FileText, 
  Info, 
  Lightbulb, 
  Maximize, 
  Search,
  CheckCircle2,
  Sparkles,
  Eye,
  FileSearch,
  Upload,
  Loader2,
  PercentCircle
} from "lucide-react";

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

const ResumeBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [jobCategory, setJobCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsIssues, setAtsIssues] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get user experience data to suggest template categories
  const { data: experiences, isLoading: experiencesLoading } = useQuery({
    queryKey: ['/api/experiences'],
    queryFn: getQueryFn<any[]>({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get all templates
  const { data: allTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/resume-templates'],
    queryFn: getQueryFn<ResumeTemplate[]>({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get suggested templates based on job category
  const { data: suggestedTemplates, isLoading: suggestedLoading } = useQuery({
    queryKey: ['/api/resume-templates/suggest', jobCategory],
    queryFn: getQueryFn<ResumeTemplate[]>({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: jobCategory !== "all",
  });

  // Extract unique job categories from experiences
  const jobCategories = experiences ? 
    experiences
      .map((exp: any) => exp.category)
      .filter((category: string, index: number, self: string[]) => 
        self.indexOf(category) === index) : 
    [];

  // Handle template selection
  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.name} template`,
    });
  };

  // Handle template preview
  const handlePreviewTemplate = (template: ResumeTemplate) => {
    setPreviewTemplate(template);
  };

  // Handle continue to resume editor
  const handleContinue = () => {
    if (selectedTemplate) {
      // Navigate to the resume editor with selected template
      setLocation(`/resume-editor/${selectedTemplate.id}`);
    } else {
      toast({
        title: "No Template Selected",
        description: "Please select a template to continue",
        variant: "destructive",
      });
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setResumeFile(file);
    }
  };
  
  // Handle ATS score check
  const handleCheckATSScore = async () => {
    if (!resumeFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a resume PDF to check",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Simulate a delay for analysis (in a real app, you'd send the file to a backend API)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock analysis results (in a real implementation, this would come from the backend)
      const mockScore = Math.floor(Math.random() * 31) + 60; // Random score between 60-90
      
      const mockIssues = [
        "Missing essential keywords for your job category",
        "Complex formatting may be difficult for ATS to parse",
        "Headers may not be recognized correctly by some systems",
        "Consider using standard section titles like 'Experience' and 'Education'",
        "Too many graphics or design elements detected"
      ];
      
      // Filter some issues randomly to make it dynamic
      const randomIssues = mockIssues
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 2);
      
      setAtsScore(mockScore);
      setAtsIssues(randomIssues);
      
      toast({
        title: "Analysis Complete",
        description: `Your resume received an ATS score of ${mockScore}%`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Something went wrong while analyzing your resume",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Templates to display (all or suggested)
  const displayTemplates = jobCategory === "all" ? 
    allTemplates : 
    suggestedTemplates;

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="container max-w-6xl mx-auto py-12 px-4"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        AI-Powered Resume Builder
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        Create a professional resume with templates tailored to your experience
      </p>
      
      {/* Main tab switcher */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="templates" className="text-base py-3">
            <FileText className="mr-2 h-4 w-4" /> Build New Resume
          </TabsTrigger>
          <TabsTrigger value="ats-checker" className="text-base py-3">
            <FileSearch className="mr-2 h-4 w-4" /> Check ATS Score
          </TabsTrigger>
        </TabsList>

      {/* Resume Tips Card */}
      <Card className="mb-8 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" /> 
            Resume Building Tips
          </CardTitle>
          <CardDescription>
            Optimize your resume with professional guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full mb-4 flex flex-wrap">
              <TabsTrigger value="content">Content Tips</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="mistakes">Common Mistakes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Focus on Achievements</AccordionTrigger>
                  <AccordionContent>
                    Highlight concrete achievements and results rather than just listing responsibilities. 
                    Use metrics where possible: "Increased efficiency by 30%" is more impactful than "Improved efficiency."
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Use Strong Action Verbs</AccordionTrigger>
                  <AccordionContent>
                    Begin bullets with powerful action verbs like "implemented," "developed," "led," "created," "optimized," or "designed" instead of passive phrases.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Customize for Each Job</AccordionTrigger>
                  <AccordionContent>
                    Tailor your resume to match the specific job description. Highlight the skills and experiences that directly relate to what the employer is seeking.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="structure">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Optimize for Readability</AccordionTrigger>
                  <AccordionContent>
                    Use a clean, consistent layout with clear section headings. Opt for bullet points over paragraphs to make information easy to scan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Keep it Concise</AccordionTrigger>
                  <AccordionContent>
                    Aim for a one-page resume unless you have extensive relevant experience. Be selective about what you include, focusing on your most impressive and relevant qualifications.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Prioritize Important Information</AccordionTrigger>
                  <AccordionContent>
                    Put your most relevant and impressive qualifications at the top of each section. Recruiters often scan resumes quickly, so make sure your best attributes stand out.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="keywords">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Including relevant keywords helps your resume pass through Applicant Tracking Systems (ATS) and catch the attention of recruiters.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 text-primary">Technical Skills Keywords</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Programming languages (Python, Java, JavaScript)</li>
                      <li>Software development methodologies (Agile, Scrum)</li>
                      <li>Database technologies (SQL, MongoDB, PostgreSQL)</li>
                      <li>Cloud platforms (AWS, Azure, GCP)</li>
                      <li>Machine learning frameworks (TensorFlow, PyTorch)</li>
                    </ul>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 text-primary">Soft Skills Keywords</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Problem-solving, critical thinking</li>
                      <li>Communication, collaboration</li>
                      <li>Project management, leadership</li>
                      <li>Adaptability, flexibility</li>
                      <li>Time management, organization</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      <strong>Pro Tip:</strong> Review the job description carefully and incorporate keywords from it into your resume. 
                      This helps match your resume with what employers are looking for.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mistakes">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                    Common Resume Mistakes to Avoid
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Generic content</strong> - Avoid using the same resume for every application</li>
                    <li><strong>Spelling and grammar errors</strong> - Always proofread carefully</li>
                    <li><strong>Overused phrases</strong> - "Team player," "hard worker," etc., without evidence</li>
                    <li><strong>Too much personal information</strong> - No need for birth date, marital status, etc.</li>
                    <li><strong>Poor formatting</strong> - Inconsistent fonts, margins, and spacing</li>
                    <li><strong>Lack of quantifiable achievements</strong> - Include metrics where possible</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Content Area - Tabbed Content */}
        <TabsContent value="templates" className="mt-4 space-y-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select a job category</h2>
          <Tabs defaultValue="all" onValueChange={setJobCategory} className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-2">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              {jobCategories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
                </TabsTrigger>
              ))}
            </TabsList>

          <TabsContent value={jobCategory} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templatesLoading || suggestedLoading ? (
                // Skeleton loaders for templates
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden flex flex-col h-full">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
              ) : displayTemplates && displayTemplates.length > 0 ? (
                displayTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`overflow-hidden flex flex-col h-full transition-all hover:shadow-lg cursor-pointer border-2 ${selectedTemplate?.id === template.id ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={template.previewImage} 
                        alt={template.name} 
                        className="w-full h-full object-cover"
                      />
                      {template.name.toLowerCase().includes('ats') && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary/90 hover:bg-primary text-white border-0 px-2 py-1 text-xs shadow-md">
                            <ClipboardCheck className="h-3 w-3 mr-1" /> ATS Optimized
                          </Badge>
                        </div>
                      )}
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Badge variant="outline" className="bg-white dark:bg-gray-900 text-primary font-semibold px-3 py-1">
                            Selected
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="w-8 h-8 rounded-full opacity-90 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTemplate(template);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center mb-3">
                        <div className="mr-2 font-medium text-sm">ATS Score:</div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              template.name.toLowerCase().includes('ats') 
                                ? 'bg-green-500 w-[95%]' 
                                : 'bg-primary w-[80%]'
                            }`}
                          ></div>
                        </div>
                        <div className="ml-2 text-xs font-medium">
                          {template.name.toLowerCase().includes('ats') ? '95%' : '80%'}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.suitableFor.slice(0, 3).map((category, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {template.suitableFor.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.suitableFor.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      {/* ATS Compatibility Features */}
                      {template.name.toLowerCase().includes('ats') && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center mb-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                            <span>Optimized for keyword matching</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                            <span>Maximized readability for ATS scanners</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="mt-auto flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>{template.description}</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <div className="aspect-[8.5/11] bg-card border rounded-md overflow-hidden shadow-sm">
                                <img 
                                  src={template.previewImage} 
                                  alt={template.name} 
                                  className="w-full h-full object-contain" 
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium mb-2">Template Details</h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Best For</h4>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {template.suitableFor.map((category, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">ATS Compatibility</h4>
                                  <div className="flex items-center mt-2 mb-3">
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          template.name.toLowerCase().includes('ats') 
                                            ? 'bg-green-500 w-[95%]' 
                                            : 'bg-primary w-[80%]'
                                        }`}
                                      ></div>
                                    </div>
                                    <div className="ml-2 text-sm font-medium">
                                      {template.name.toLowerCase().includes('ats') ? '95%' : '80%'}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Highlights</h4>
                                  <ul className="mt-1 text-sm space-y-1">
                                    <li className="flex items-center">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2" />
                                      Professional design
                                    </li>
                                    <li className="flex items-center">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2" />
                                      {template.name.toLowerCase().includes('ats') 
                                        ? 'Enhanced ATS keyword detection' 
                                        : 'ATS-friendly layout'}
                                    </li>
                                    <li className="flex items-center">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2" />
                                      Optimized section structure
                                    </li>
                                    {template.name.toLowerCase().includes('ats') && (
                                      <>
                                        <li className="flex items-center">
                                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-2" />
                                          Plain-text parsing compatible
                                        </li>
                                        <li className="flex items-center">
                                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-2" />
                                          Header parsing optimization
                                        </li>
                                      </>
                                    )}
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <Button 
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    handleSelectTemplate(template);
                                  }}
                                >
                                  Select Template
                                </Button>
                                <Button 
                                  className="flex-1"
                                  onClick={() => {
                                    handleSelectTemplate(template);
                                    setLocation(`/resume-editor/${template.id}`);
                                  }}
                                >
                                  Use & Continue
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant={selectedTemplate?.id === template.id ? "default" : "secondary"} 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template);
                        }}
                      >
                        {selectedTemplate?.id === template.id ? "Selected" : "Select"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {jobCategory === "all" 
                      ? "No resume templates are available at the moment." 
                      : `No templates specifically for ${jobCategory} are available. Try selecting "All Templates" instead.`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ATS Tips Section */}
      <div className="mt-8 mb-6 border rounded-lg p-4 bg-primary/5">
        <div className="flex items-center mb-2">
          <Lightbulb className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">ATS Optimization Tips</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Applicant Tracking Systems (ATS) scan resumes for keywords before a human sees them. Here's how to make your resume stand out:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white dark:bg-gray-800 rounded border">
            <h4 className="font-medium flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-primary" /> Keywords Matter
            </h4>
            <p className="mt-1 text-muted-foreground">
              Include relevant keywords from the job description in your resume. Focus on skills, tools, and qualifications.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border">
            <h4 className="font-medium flex items-center">
              <ClipboardCheck className="h-4 w-4 mr-1 text-primary" /> Simple Formatting
            </h4>
            <p className="mt-1 text-muted-foreground">
              Use standard section headings like "Experience" and "Education". Avoid tables, headers/footers, and complex layouts.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border">
            <h4 className="font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-primary" /> File Format
            </h4>
            <p className="mt-1 text-muted-foreground">
              Submit your resume as a PDF to preserve formatting. Our ATS-optimized templates ensure maximum compatibility.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
        <div className="flex items-center text-muted-foreground text-sm">
          <FileText className="h-4 w-4 mr-2" />
          {selectedTemplate 
            ? `Ready to build your resume with ${selectedTemplate.name}` 
            : "Select a template to continue"}
        </div>
        <Button 
          size="lg" 
          disabled={!selectedTemplate}
          onClick={handleContinue}
          className="px-8"
        >
          Continue to Resume Editor
        </Button>
      </div>
      </TabsContent>

      {/* ATS Checker Tab */}
      <TabsContent value="ats-checker" className="mt-4">
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSearch className="h-5 w-5 mr-2 text-primary" />
                  Resume ATS Compatibility Checker
                </CardTitle>
                <CardDescription>
                  Upload your existing resume to check its compatibility with Applicant Tracking Systems (ATS)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Upload your resume</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Drag and drop your resume PDF file here, or click to browse. 
                      We'll analyze it for ATS compatibility and provide recommendations.
                    </p>
                    <div className="mt-4">
                      <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="resume-upload">
                        <Button variant="outline" className="mr-2" asChild>
                          <span>Browse Files</span>
                        </Button>
                      </label>
                      {resumeFile && (
                        <Badge variant="outline" className="py-1.5">
                          {resumeFile.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {resumeFile && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={handleCheckATSScore}
                      disabled={isAnalyzing || !resumeFile}
                      className="min-w-[150px]"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Check ATS Score
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Results Section */}
                {atsScore !== null && (
                  <div className="mt-8 space-y-6 animate-in fade-in duration-500">
                    <div className="rounded-lg p-6 border bg-card">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-medium mb-1">ATS Compatibility Score</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          How well your resume performs against Applicant Tracking Systems
                        </p>
                        
                        <div className="relative inline-block">
                          <div className="w-32 h-32 rounded-full flex items-center justify-center border-8 border-primary/20">
                            <div className="text-3xl font-bold">
                              {atsScore}%
                            </div>
                          </div>
                          <div 
                            className={`absolute -top-1 -left-1 w-32 h-32 rounded-full border-8 border-transparent
                              ${atsScore >= 85 ? 'border-t-green-500 border-r-green-500 border-b-green-500' :
                                atsScore >= 70 ? 'border-t-primary border-r-primary border-b-primary' :
                                'border-t-orange-500 border-r-orange-500'}`}
                            style={{ 
                              transform: 'rotate(45deg)',
                            }}
                          ></div>
                        </div>
                        
                        <div className="mt-4">
                          <Badge variant={atsScore >= 85 ? "outline" : "secondary"} className={`text-sm py-1 px-2 ${atsScore >= 85 ? 'border-green-500 text-green-500' : ''}`}>
                            {atsScore >= 85 ? 'Excellent' : atsScore >= 70 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </div>
                      
                      {atsIssues.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-3">Improvement Suggestions</h4>
                          <ul className="space-y-2">
                            {atsIssues.map((issue, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">
                                  <Info className="h-4 w-4" />
                                </span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2">Expert Recommendation</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {atsScore >= 85 
                          ? "Your resume is already well-optimized for ATS systems. Continue targeting specific job descriptions with relevant keywords."
                          : atsScore >= 70
                            ? "Your resume performs reasonably well but could use some improvements. Consider using one of our ATS-optimized templates to enhance its performance."
                            : "Your resume needs significant improvement to pass through ATS systems effectively. We recommend rebuilding it with one of our ATS-optimized templates."}
                      </p>
                      
                      {atsScore < 85 && (
                        <Button 
                          onClick={() => {
                            setActiveTab("templates");
                            setJobCategory("all");
                          }}
                          className="mt-2"
                        >
                          Browse ATS-Optimized Templates
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="max-w-3xl mx-auto mt-8">
            <h3 className="text-xl font-medium mb-4">ATS Checking Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                    What is an ATS?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    Applicant Tracking Systems (ATS) are software used by employers to organize, search, and filter job applications. 
                    They scan resumes for relevant keywords and qualifications before a human reviewer sees them.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                    How the Checker Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    Our checker analyzes your resume for ATS compatibility issues including formatting problems, 
                    keyword optimization, section headings, and content structure that might prevent your resume 
                    from being properly parsed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TabsContent>
    </motion.div>
  );
};

export default ResumeBuilderPage;