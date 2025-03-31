import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Info,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  BrainCircuit,
  Clock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SectionFeedback {
  section: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

interface FeedbackItem {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  impact: 'high' | 'medium' | 'low';
  suggestions?: string[];
}

interface ResumeFeedbackProps {
  resumeData: any;
  onApplySuggestion?: (section: string, suggestion: string) => void;
}

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Mock function to analyze a resume and provide feedback
const analyzeResume = (resumeData: any): {
  overallScore: number;
  sectionFeedback: SectionFeedback[];
  feedbackItems: FeedbackItem[];
} => {
  // This would be an actual API call in a real application
  
  // Mock section feedback
  const sectionFeedback: SectionFeedback[] = [
    {
      section: 'Summary',
      score: 75,
      feedback: 'Your summary is concise but could highlight more specific achievements.',
      suggestions: [
        'Add a specific metric that demonstrates your impact in your field',
        'Mention your expertise in technologies that are central to your role',
        'Include a career achievement that sets you apart from others'
      ]
    },
    {
      section: 'Experience',
      score: 88,
      feedback: 'Strong experience section with good use of action verbs.',
      suggestions: [
        'Consider adding one more quantifiable achievement to your most recent role',
        'Ensure all technical terms are consistently capitalized'
      ]
    },
    {
      section: 'Skills',
      score: 65,
      feedback: 'Skills section needs more organization and specificity.',
      suggestions: [
        'Group skills by category (e.g., Programming Languages, Tools, Soft Skills)',
        'Remove generic skills and focus on technical and specialized abilities',
        'Add proficiency levels to your key technical skills'
      ]
    },
    {
      section: 'Education',
      score: 90,
      feedback: 'Education section is well-structured and complete.',
      suggestions: [
        'Consider adding relevant coursework if you are early in your career'
      ]
    }
  ];
  
  // Mock feedback items
  const feedbackItems: FeedbackItem[] = [
    {
      id: generateId(),
      type: 'error',
      message: 'Your resume lacks quantifiable achievements',
      impact: 'high',
      suggestions: [
        'Add metrics to demonstrate impact (e.g., "increased efficiency by 35%")',
        'Include specific project outcomes with measurable results',
        'Quantify team size or budget managed where applicable'
      ]
    },
    {
      id: generateId(),
      type: 'warning',
      message: 'Summary section is too generic',
      impact: 'medium',
      suggestions: [
        'Tailor your summary to highlight skills relevant to your target position',
        'Include industry-specific keywords in your summary',
        'Start with a strong statement about your professional identity'
      ]
    },
    {
      id: generateId(),
      type: 'warning',
      message: 'Skills section could be more organized',
      impact: 'medium',
      suggestions: [
        'Group similar skills together under categories',
        'Prioritize skills most relevant to your target role',
        'Remove outdated or irrelevant skills'
      ]
    },
    {
      id: generateId(),
      type: 'success',
      message: 'Good use of action verbs in experience section',
      impact: 'medium'
    },
    {
      id: generateId(),
      type: 'info',
      message: 'Consider adding a projects section',
      impact: 'low',
      suggestions: [
        'Include 2-3 relevant projects with brief descriptions',
        'Highlight the technologies used and your specific role',
        'Link to GitHub or portfolio if available'
      ]
    }
  ];
  
  // Calculate overall score based on section scores
  const totalSections = sectionFeedback.length;
  const sumScores = sectionFeedback.reduce((sum, section) => sum + section.score, 0);
  const overallScore = Math.round(sumScores / totalSections);
  
  return {
    overallScore,
    sectionFeedback,
    feedbackItems
  };
};

const ResumeFeedback: React.FC<ResumeFeedbackProps> = ({
  resumeData,
  onApplySuggestion
}) => {
  const [feedbackData, setFeedbackData] = useState<{
    overallScore: number;
    sectionFeedback: SectionFeedback[];
    feedbackItems: FeedbackItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Auto-analyze when component mounts
    handleAnalyze();
  }, []);
  
  const handleAnalyze = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = analyzeResume(resumeData);
      setFeedbackData(results);
      setIsLoading(false);
      
      // Auto-expand high impact items
      const highImpactIds = results.feedbackItems
        .filter(item => item.impact === 'high' && (item.type === 'error' || item.type === 'warning'))
        .map(item => item.id);
      
      setExpandedItems(highImpactIds);
    }, 1500);
  };
  
  const handleApplySuggestion = (section: string, suggestion: string) => {
    if (onApplySuggestion) {
      onApplySuggestion(section, suggestion);
      
      toast({
        title: "Suggestion applied",
        description: "Your resume has been updated with the suggested change",
      });
    }
  };
  
  const toggleExpandItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  
  // Get the score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Get the progress color based on value
  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Icon for feedback type
  const getFeedbackIcon = (type: 'error' | 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Badge for impact level
  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <Badge variant="outline" className="text-xs border-red-200 text-red-600">High Impact</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs border-amber-200 text-amber-600">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">Low Impact</Badge>;
    }
  };
  
  return (
    <Card className="w-full shadow-sm border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
          Resume Analysis & Feedback
        </CardTitle>
        <CardDescription>
          Get personalized feedback and suggestions to improve your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-lg font-medium">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground">
                Our AI is reviewing your resume for optimal content and formatting
              </p>
            </div>
            <Progress value={45} className="max-w-md mx-auto" />
          </div>
        ) : feedbackData ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Resume Score</h3>
                <p className="text-sm text-muted-foreground">
                  Based on content, formatting, and ATS compatibility
                </p>
              </div>
              <div className="text-center">
                <div 
                  className={`text-3xl font-bold ${getScoreColor(feedbackData.overallScore)}`}
                >
                  {feedbackData.overallScore}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {feedbackData.overallScore >= 85 
                    ? 'Excellent' 
                    : feedbackData.overallScore >= 70 
                    ? 'Good'
                    : 'Needs Improvement'}
                </div>
              </div>
            </div>
            
            {/* Section Scores */}
            <div>
              <h3 className="text-base font-medium mb-3">Section Analysis</h3>
              <div className="space-y-3">
                {feedbackData.sectionFeedback.map((section, index) => (
                  <Accordion 
                    key={index} 
                    type="single" 
                    collapsible 
                    className="border px-4 rounded-lg"
                  >
                    <AccordionItem value="item-1" className="border-0">
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{section.section}</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={section.score} 
                                className={`w-16 h-1.5 ${getProgressColor(section.score)}`} 
                              />
                              <span className={`text-sm ${getScoreColor(section.score)}`}>
                                {section.score}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pb-2 space-y-3">
                          <p className="text-sm">{section.feedback}</p>
                          {section.suggestions.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                              <ul className="space-y-2">
                                {section.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 text-sm">
                                      <p>{suggestion}</p>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0 text-primary text-xs flex items-center mt-1"
                                        onClick={() => handleApplySuggestion(section.section, suggestion)}
                                      >
                                        Apply this suggestion
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
            
            {/* Detailed Feedback */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium">Detailed Feedback</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAnalyze}
                  className="h-8"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Analysis
                </Button>
              </div>
              
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {feedbackData.feedbackItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 border rounded-lg ${
                        item.type === 'error' 
                          ? 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50' 
                          : item.type === 'warning'
                          ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50'
                          : item.type === 'success'
                          ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900/50'
                          : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/50'
                      }`}
                    >
                      <div 
                        className="flex items-start gap-2 cursor-pointer"
                        onClick={() => toggleExpandItem(item.id)}
                      >
                        <div className="mt-0.5">
                          {getFeedbackIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{item.message}</span>
                            {getImpactBadge(item.impact)}
                          </div>
                          
                          {expandedItems.includes(item.id) && item.suggestions && (
                            <div className="mt-2 space-y-2">
                              {item.suggestions.map((suggestion, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs">{suggestion}</p>
                                    <Button 
                                      variant="link" 
                                      size="sm" 
                                      className="h-auto p-0 text-primary text-xs flex items-center mt-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Determine which section this suggestion applies to
                                        // This is a simplification; in a real app you'd have more precise mapping
                                        const section = item.message.toLowerCase().includes('summary') 
                                          ? 'Summary' 
                                          : item.message.toLowerCase().includes('experience')
                                          ? 'Experience'
                                          : item.message.toLowerCase().includes('skills')
                                          ? 'Skills'
                                          : item.message.toLowerCase().includes('education')
                                          ? 'Education'
                                          : 'Summary';
                                        
                                        handleApplySuggestion(section, suggestion);
                                      }}
                                    >
                                      Apply
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No feedback available</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Click the analyze button to get personalized feedback on your resume
            </p>
            <Button onClick={handleAnalyze}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Analyze Resume
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          Learn more about resume best practices
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResumeFeedback;