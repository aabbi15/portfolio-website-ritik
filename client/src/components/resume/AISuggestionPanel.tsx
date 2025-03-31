import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Briefcase, 
  MoveUpRight,
  Lightbulb,
  PencilLine,
  Clipboard
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AISuggestionPanelProps {
  type: 'summary' | 'bullet' | 'skills' | 'title';
  jobTitle?: string;
  jobDescription?: string;
  currentText?: string;
  onSelectSuggestion: (suggestion: string) => void;
}

// Generate suggestions based on the provided text and type
const generateSuggestions = (
  type: 'summary' | 'bullet' | 'skills' | 'title',
  jobTitle?: string,
  jobDescription?: string,
  currentText?: string
): string[] => {
  // This is a mock function - in a real implementation,
  // this would call an API to get AI-generated suggestions
  
  if (type === 'summary') {
    return [
      "Results-driven Full Stack Developer with 5+ years of experience specializing in backend systems and AI integration. Proven track record of architecting scalable solutions that leverage machine learning to solve complex business problems.",
      "Backend specialist with extensive experience in distributed systems and cloud architecture. Passionate about implementing AI/ML solutions to enhance product functionality and user experience.",
      "Innovative software engineer with a focus on backend development and a strong foundation in AI technologies. Expert in building reliable systems that seamlessly integrate machine learning capabilities."
    ];
  } else if (type === 'bullet') {
    return [
      "Architected and implemented a microservices platform that reduced system latency by 40% and improved scalability across distributed systems.",
      "Developed and deployed machine learning models that increased customer engagement by 35% through personalized content recommendations.",
      "Led the migration of legacy systems to cloud infrastructure, resulting in a 50% reduction in operational costs and improved system reliability.",
      "Optimized database performance by implementing advanced indexing strategies, reducing query execution time by 60%."
    ];
  } else if (type === 'skills') {
    return [
      "Node.js, Express, Python, Django, Flask",
      "TensorFlow, PyTorch, scikit-learn, NLP",
      "PostgreSQL, MongoDB, Redis, Elasticsearch",
      "AWS, Docker, Kubernetes, CI/CD, Microservices",
      "System Architecture, API Design, Data Modeling"
    ];
  } else {
    // Title suggestions
    return [
      "Senior Backend Engineer with ML Expertise",
      "Full Stack Developer specializing in AI Integration",
      "Software Architect & Machine Learning Engineer",
      "Backend Specialist & AI Solutions Developer"
    ];
  }
};

const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
  type,
  jobTitle,
  jobDescription,
  currentText,
  onSelectSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<string[]>(
    generateSuggestions(type, jobTitle, jobDescription, currentText)
  );
  const [customJobDescription, setCustomJobDescription] = useState(jobDescription || '');
  const [useCustomJobDescription, setUseCustomJobDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("suggestions");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const refreshSuggestions = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newSuggestions = generateSuggestions(
        type, 
        jobTitle,
        useCustomJobDescription ? customJobDescription : jobDescription,
        currentText
      );
      setSuggestions(newSuggestions);
      setIsGenerating(false);
      
      toast({
        title: "New suggestions generated",
        description: "We've created new AI suggestions based on your profile",
      });
    }, 1500);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this text wherever you need it",
    });
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    toast({
      title: "Suggestion applied",
      description: "The selected text has been added to your resume",
    });
  };

  return (
    <Card className="w-full shadow-sm border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI {type === 'summary' ? 'Summary' : 
              type === 'bullet' ? 'Experience Bullet' : 
              type === 'skills' ? 'Skills' : 'Title'} Suggestions
        </CardTitle>
        <CardDescription>
          {type === 'summary' 
            ? "Let AI help craft a professional summary that highlights your strengths"
            : type === 'bullet'
            ? "Generate powerful bullet points to showcase your experience"
            : type === 'skills'
            ? "Recommend relevant skills based on your experience"
            : "Create a professional job title that matches your experience"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-4">
            <ScrollArea className="h-[260px] pr-4">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="mb-3 p-3 border rounded-md bg-card hover:border-primary/50 transition-all group relative"
                >
                  <p className="text-sm">
                    {suggestion}
                  </p>
                  <div className="mt-2 flex gap-2 justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 w-8 p-0" 
                            onClick={() => handleCopyToClipboard(suggestion)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Use This
                    </Button>
                  </div>
                  
                  {type === 'bullet' && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-xs bg-background/80">
                      {index % 2 === 0 ? 'Achievement' : 'Technical'}
                    </Badge>
                  )}
                  
                  {type === 'summary' && index === 0 && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-xs bg-background/80 text-green-600 border-green-200">
                      ATS Optimized
                    </Badge>
                  )}
                </div>
              ))}
            </ScrollArea>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <Lightbulb className="h-3 w-3 inline-block mr-1" />
                Suggestions are based on your profile and industry standards
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refreshSuggestions}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-job-description" 
                  checked={useCustomJobDescription}
                  onCheckedChange={setUseCustomJobDescription}
                />
                <Label htmlFor="use-job-description">
                  Use custom job description for targeted suggestions
                </Label>
              </div>
              
              {useCustomJobDescription && (
                <div className="space-y-2">
                  <Label htmlFor="job-description">
                    Job Description <span className="text-xs text-muted-foreground">(Copy & paste from job listing)</span>
                  </Label>
                  <Textarea 
                    id="job-description"
                    placeholder="Paste the job description here to get tailored suggestions..."
                    className="min-h-[120px] text-sm"
                    value={customJobDescription}
                    onChange={(e) => setCustomJobDescription(e.target.value)}
                  />
                  
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    Using job descriptions helps tailor your resume to specific requirements
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Customize Tone & Style</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="outline" className="text-xs justify-start">
                    <PencilLine className="h-3 w-3 mr-1" /> Professional
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs justify-start">
                    <PencilLine className="h-3 w-3 mr-1" /> Technical
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs justify-start">
                    <PencilLine className="h-3 w-3 mr-1" /> Creative
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  className="w-full"
                  onClick={refreshSuggestions}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Generate Custom Suggestions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-0 border-t flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clipboard className="h-3.5 w-3.5 mr-1" />
          <span>AI-powered by Resume Analysis Technology</span>
        </div>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          <span>Advanced Options</span>
          <MoveUpRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AISuggestionPanel;