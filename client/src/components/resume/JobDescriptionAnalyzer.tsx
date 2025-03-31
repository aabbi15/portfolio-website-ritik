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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  CheckCircle2, 
  AlarmClock,
  ArrowUp,
  Target,
  PieChart,
  List,
  CircleX,
  ArrowDown,
  AlertCircle,
  ArrowDownNarrowWide,
  Briefcase,
  ChevronDown,
  ChevronUp,
  BarChart,
  Sparkles
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface KeywordMatch {
  keyword: string;
  count: number;
  importance: 'high' | 'medium' | 'low';
  present: boolean;
}

interface AnalysisResult {
  matchScore: number;
  keywordMatches: KeywordMatch[];
  missedKeywords: string[];
  strongSections: string[];
  weakSections: string[];
  recommendations: string[];
}

interface JobDescriptionAnalyzerProps {
  resumeData?: any;
  onOptimizationClick?: (missedKeywords: string[]) => void;
}

// Mock function to analyze a resume against a job description
const analyzeJobMatch = (jobDescription: string, resumeData: any): AnalysisResult => {
  // This is a mock implementation - in a real application, 
  // this would use NLP or other algorithms to analyze the match
  
  // Simulate some processing delay
  
  // Mock data for demonstration
  const keywordMatches: KeywordMatch[] = [
    { keyword: 'backend development', count: 3, importance: 'high', present: true },
    { keyword: 'API design', count: 2, importance: 'high', present: true },
    { keyword: 'Node.js', count: 4, importance: 'high', present: true },
    { keyword: 'database optimization', count: 1, importance: 'medium', present: true },
    { keyword: 'machine learning', count: 2, importance: 'medium', present: true },
    { keyword: 'AWS', count: 3, importance: 'medium', present: true },
    { keyword: 'agile methodology', count: 0, importance: 'medium', present: false },
    { keyword: 'CI/CD', count: 1, importance: 'low', present: true },
    { keyword: 'Python', count: 0, importance: 'high', present: false },
    { keyword: 'team leadership', count: 0, importance: 'high', present: false },
    { keyword: 'microservices', count: 2, importance: 'medium', present: true },
    { keyword: 'Docker', count: 0, importance: 'low', present: false },
  ];
  
  // Filter out missed keywords
  const missedKeywords = keywordMatches
    .filter(km => !km.present && km.importance !== 'low')
    .map(km => km.keyword);
  
  // Calculate match score (weighted)
  const totalHighImportance = keywordMatches.filter(km => km.importance === 'high').length;
  const totalMediumImportance = keywordMatches.filter(km => km.importance === 'medium').length;
  
  const matchedHighImportance = keywordMatches.filter(km => km.importance === 'high' && km.present).length;
  const matchedMediumImportance = keywordMatches.filter(km => km.importance === 'medium' && km.present).length;
  
  // Weight high importance 2x more than medium
  const weightedScore = 
    ((matchedHighImportance * 2) + matchedMediumImportance) / 
    ((totalHighImportance * 2) + totalMediumImportance);
  
  const matchScore = Math.round(weightedScore * 100);
  
  return {
    matchScore,
    keywordMatches,
    missedKeywords,
    strongSections: ['Skills', 'Experience'],
    weakSections: ['Summary', 'Projects'],
    recommendations: [
      'Add Python experience to your skills section',
      'Highlight team leadership experience in your work history',
      'Include specific examples of agile methodology implementation',
      'Strengthen your summary section with key job requirements'
    ]
  };
};

const KeywordMatchItem: React.FC<{ match: KeywordMatch }> = ({ match }) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center">
        {match.present ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
        ) : (
          <CircleX className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
        )}
        <span className="text-sm">{match.keyword}</span>
        <Badge 
          variant="outline" 
          className={`ml-2 text-xs px-1.5 py-0 ${
            match.importance === 'high' 
              ? 'border-amber-500 text-amber-500 dark:border-amber-400 dark:text-amber-400'
              : match.importance === 'medium'
              ? 'border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400'
              : 'text-muted-foreground'
          }`}
        >
          {match.importance}
        </Badge>
      </div>
      {match.present && (
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground mr-1">Found {match.count}×</span>
        </div>
      )}
    </div>
  );
};

const JobDescriptionAnalyzer: React.FC<JobDescriptionAnalyzerProps> = ({
  resumeData,
  onOptimizationClick
}) => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAllKeywords, setShowAllKeywords] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 50) {
      toast({
        title: "Job description too short",
        description: "Please paste a complete job description for better analysis",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate API delay
    setTimeout(() => {
      const result = analyzeJobMatch(jobDescription, resumeData);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      if (result.matchScore < 60) {
        toast({
          title: "Low match score detected",
          description: "We've found some important keywords missing from your resume",
          variant: "destructive",
        });
      } else if (result.matchScore >= 85) {
        toast({
          title: "Great match!",
          description: "Your resume is well-matched to this job description",
        });
      } else {
        toast({
          title: "Analysis complete",
          description: `Your resume has a ${result.matchScore}% match with this job description`,
        });
      }
    }, 2500);
  };

  const handleOptimizeClick = () => {
    if (analysisResult && onOptimizationClick) {
      onOptimizationClick(analysisResult.missedKeywords);
    }
  };

  return (
    <Card className="w-full shadow-sm border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Job Description Analysis
        </CardTitle>
        <CardDescription>
          Analyze how well your resume matches a specific job description
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysisResult ? (
          <>
            <Textarea
              placeholder="Paste the job description here to analyze how well your resume matches..."
              className="min-h-[200px] text-sm"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5 inline-block mr-1" />
                <span>We'll analyze the keywords and requirements</span>
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || jobDescription.length < 30}
              >
                {isAnalyzing ? (
                  <>
                    <AlarmClock className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Match
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Match Score</h3>
                <Badge 
                  variant={analysisResult.matchScore >= 85 ? "outline" : "secondary"}
                  className={`px-2 py-1 ${
                    analysisResult.matchScore >= 85 
                      ? 'text-green-500 border-green-500' 
                      : analysisResult.matchScore >= 60
                      ? 'text-amber-500 border-amber-500'
                      : 'text-red-500 border-red-500'
                  }`}
                >
                  {analysisResult.matchScore}%
                </Badge>
              </div>
              <Progress value={analysisResult.matchScore} className="h-2" />
              
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <div className="flex items-center">
                  {analysisResult.matchScore >= 85 ? (
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : analysisResult.matchScore >= 60 ? (
                    <PieChart className="h-3 w-3 text-amber-500 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span>
                    {analysisResult.matchScore >= 85 
                      ? 'Excellent match! Your resume is well-aligned with this job.' 
                      : analysisResult.matchScore >= 60
                      ? 'Good match with room for improvement.'
                      : 'Low match. Consider updating your resume for this position.'}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Tabs defaultValue="keywords" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="sections">Section Analysis</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="keywords" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium flex items-center">
                        <List className="h-4 w-4 mr-1 text-primary" />
                        Keywords Analysis
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setShowAllKeywords(!showAllKeywords)}
                      >
                        {showAllKeywords ? 'Show Important' : 'Show All'}
                        {showAllKeywords ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-0.5">
                        {analysisResult.keywordMatches
                          .filter(match => showAllKeywords ? true : match.importance !== 'low')
                          .sort((a, b) => {
                            // First by importance, then by presence
                            const importanceOrder = { high: 0, medium: 1, low: 2 };
                            const aImportance = importanceOrder[a.importance];
                            const bImportance = importanceOrder[b.importance];
                            
                            if (aImportance !== bImportance) return aImportance - bImportance;
                            return a.present === b.present ? 0 : a.present ? -1 : 1;
                          })
                          .map((match, index) => (
                            <KeywordMatchItem key={index} match={match} />
                          ))
                        }
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {analysisResult.missedKeywords.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button 
                        onClick={handleOptimizeClick} 
                        className="w-full"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Optimize for Missing Keywords
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sections" className="space-y-4">
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="strength">
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center text-sm">
                          <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                          Strong Sections
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-2">
                          {analysisResult.strongSections.map((section, index) => (
                            <div key={index} className="flex items-center py-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-2" />
                              <span className="text-sm">{section}</span>
                            </div>
                          ))}
                          <div className="text-xs text-muted-foreground pl-5 pt-1">
                            These sections match well with the job requirements.
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="weakness">
                      <AccordionTrigger className="py-3">
                        <div className="flex items-center text-sm">
                          <ArrowDown className="h-4 w-4 text-red-500 mr-2" />
                          Sections to Improve
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-2">
                          {analysisResult.weakSections.map((section, index) => (
                            <div key={index} className="flex items-start py-1">
                              <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-2 mt-0.5" />
                              <div>
                                <span className="text-sm">{section}</span>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {section === 'Summary' 
                                    ? 'Add more relevant keywords to your summary section to highlight your qualifications.' 
                                    : section === 'Projects'
                                    ? 'Focus on projects that demonstrate relevant skills mentioned in the job description.'
                                    : 'This section could be improved with more job-relevant content.'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <Card className="border border-dashed bg-muted/30">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm flex items-center">
                        <BarChart className="h-4 w-4 text-primary mr-2" />
                        Content Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Skills relevance</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Experience relevance</span>
                            <span>72%</span>
                          </div>
                          <Progress value={72} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Summary relevance</span>
                            <span>45%</span>
                          </div>
                          <Progress value={45} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Projects relevance</span>
                            <span>52%</span>
                          </div>
                          <Progress value={52} className="h-1.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-3">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-1 text-primary" />
                      Personalized Recommendations
                    </h4>
                    
                    <ScrollArea className="h-[260px]">
                      <div className="space-y-2">
                        {analysisResult.recommendations.map((recommendation, index) => (
                          <div key={index} className="p-3 border rounded-md bg-card">
                            <div className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5" />
                              <span className="text-sm">{recommendation}</span>
                            </div>
                          </div>
                        ))}
                        
                        <div className="p-3 border border-dashed rounded-md bg-primary/5 mt-4">
                          <div className="flex items-start">
                            <Briefcase className="h-4 w-4 text-primary mr-2 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium">General advice</span>
                              <p className="text-xs text-muted-foreground mt-1">
                                Tailor your resume to each job application. Emphasize experiences 
                                and skills that directly relate to the position you're applying for.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    <div className="pt-2 border-t">
                      <Button 
                        onClick={handleOptimizeClick} 
                        className="w-full"
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Apply These Recommendations
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="pt-2 flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setAnalysisResult(null);
                  setJobDescription('');
                }}
              >
                <ArrowDownNarrowWide className="mr-2 h-4 w-4" />
                Analyze Another Job
              </Button>
              
              <Button 
                size="sm"
                onClick={handleOptimizeClick}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Resume
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Search className="h-3.5 w-3.5 mr-1" />
          <span>Powered by intelligent keyword matching algorithm</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobDescriptionAnalyzer;