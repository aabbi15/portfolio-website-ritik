import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layout,
  Grid,
  FileText,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  ArrowRight,
  Star,
  Filter,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResumeTemplate {
  id: number;
  name: string;
  description: string;
  previewImage: string;
  structure: string;
  style: string;
  suitableFor: string[];
  updatedAt: string;
  isAtsOptimized?: boolean;
  atsScore?: number;
  isPremium?: boolean;
  colorOptions?: string[];
  fontOptions?: string[];
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: ResumeTemplate) => void;
  defaultIndustry?: string;
  defaultCareerLevel?: string;
  templates?: ResumeTemplate[];
  isLoading?: boolean;
}

// Modified to use industry-specific templates
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  defaultIndustry = 'technology',
  defaultCareerLevel = 'mid',
  templates = [],
  isLoading = false
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(defaultIndustry);
  const [selectedCareerLevel, setSelectedCareerLevel] = useState<string>(defaultCareerLevel);
  const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [showOnlyAts, setShowOnlyAts] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const { toast } = useToast();
  
  // List of available industries and career levels
  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'technology', label: 'Technology & IT' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare & Medical' },
    { value: 'marketing', label: 'Marketing & Creative' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'education', label: 'Education & Research' },
    { value: 'consulting', label: 'Consulting & Business' },
    { value: 'retail', label: 'Retail & E-commerce' }
  ];
  
  const careerLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid-Career' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
    { value: 'career-change', label: 'Career Transition' }
  ];
  
  // Filtered templates based on industry and career level
  const filteredTemplates = templates.filter(template => {
    const industryMatch = selectedIndustry === 'all' || 
      template.suitableFor.some(category => category.toLowerCase().includes(selectedIndustry));
    
    const careerLevelMatch = selectedCareerLevel === 'all' || 
      template.suitableFor.some(category => category.toLowerCase().includes(selectedCareerLevel));
    
    const atsMatch = !showOnlyAts || (template.isAtsOptimized || (template.atsScore && template.atsScore > 85));
    
    return industryMatch && careerLevelMatch && atsMatch;
  });
  
  // Handle template selection
  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.name} template`,
    });
  };
  
  // Handle template preview
  const handlePreviewTemplate = (template: ResumeTemplate) => {
    setPreviewTemplate(template);
  };
  
  // Mock loading state if needed
  const displayTemplates = isLoading ? [] : filteredTemplates;
  
  return (
    <Card className="w-full shadow-sm border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Layout className="h-5 w-5 mr-2 text-primary" />
          Resume Template Selection
        </CardTitle>
        <CardDescription>
          Choose a professional template optimized for your industry and experience level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select 
              value={selectedIndustry} 
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Industries</SelectLabel>
                  {industries.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select 
              value={selectedCareerLevel} 
              onValueChange={setSelectedCareerLevel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select career level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Career Level</SelectLabel>
                  {careerLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex shrink-0 gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className={layoutView === 'grid' ? 'bg-accent' : ''}
              onClick={() => setLayoutView('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className={layoutView === 'list' ? 'bg-accent' : ''}
              onClick={() => setLayoutView('list')}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={showOnlyAts ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => setShowOnlyAts(!showOnlyAts)}
              title="Show only ATS-optimized templates"
            >
              <ClipboardCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="pt-2">
          {isLoading ? (
            layoutView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-44 w-full" />
                    <CardHeader className="py-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent className="py-0">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardContent>
                    <CardFooter className="py-3">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex border rounded-lg overflow-hidden">
                    <Skeleton className="h-24 w-20 shrink-0" />
                    <div className="p-3 flex-1">
                      <Skeleton className="h-5 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    <div className="p-3 flex items-center">
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : displayTemplates.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">No matching templates</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                We couldn't find templates matching your current filter settings.
                Try selecting different industry or career level options.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSelectedIndustry('all');
                setSelectedCareerLevel('all');
                setShowOnlyAts(false);
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            layoutView === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="relative h-44 bg-muted/40 overflow-hidden">
                        <img 
                          src={template.previewImage} 
                          alt={template.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x300/f5f5f5/666666?text=Template+Preview";
                          }}
                        />
                        
                        {template.isAtsOptimized && (
                          <Badge 
                            className="absolute top-2 left-2 bg-green-500/90 hover:bg-green-500 text-white border-0"
                          >
                            <ClipboardCheck className="h-3 w-3 mr-1" /> ATS Optimized
                          </Badge>
                        )}
                        
                        {template.isPremium && (
                          <Badge 
                            variant="outline" 
                            className="absolute top-2 right-2 bg-amber-500/90 hover:bg-amber-500 text-white border-0"
                          >
                            <Star className="h-3 w-3 mr-1" /> Premium
                          </Badge>
                        )}
                        
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Check className="h-8 w-8 text-white bg-primary rounded-full p-1.5" />
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="py-0 px-4">
                        <div className="mb-3">
                          <div className="flex items-center mb-1">
                            <span className="text-xs font-medium">ATS Compatibility</span>
                            <span className="ml-auto text-xs">
                              {template.atsScore || (template.isAtsOptimized ? 95 : 80)}%
                            </span>
                          </div>
                          <Progress 
                            value={template.atsScore || (template.isAtsOptimized ? 95 : 80)} 
                            className="h-1.5" 
                          />
                        </div>
                        
                        <div className="flex flex-wrap gap-1 my-2">
                          {template.suitableFor.slice(0, 3).map((category, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                              {category}
                            </Badge>
                          ))}
                          {template.suitableFor.length > 3 && (
                            <Badge className="text-xs px-1.5 py-0" variant="outline">
                              +{template.suitableFor.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="py-3 flex items-center justify-between">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewTemplate(template);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
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
                                <div className="space-y-4">
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
                                            template.isAtsOptimized
                                              ? 'bg-green-500 w-[95%]' 
                                              : 'bg-primary w-[80%]'
                                          }`}
                                        ></div>
                                      </div>
                                      <div className="ml-2 text-sm font-medium">
                                        {template.atsScore || (template.isAtsOptimized ? 95 : 80)}%
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {template.colorOptions && (
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">Color Options</h4>
                                      <div className="flex gap-2 mt-2">
                                        {template.colorOptions.map((color, i) => (
                                          <div 
                                            key={i} 
                                            className="w-6 h-6 rounded-full border cursor-pointer"
                                            style={{ backgroundColor: color }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {template.fontOptions && (
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground">Font Options</h4>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {template.fontOptions.map((font, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {font}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Highlights</h4>
                                    <ul className="mt-1 text-sm space-y-1">
                                      <li className="flex items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2" />
                                        Professional design
                                      </li>
                                      <li className="flex items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2" />
                                        {template.isAtsOptimized
                                          ? 'Enhanced ATS keyword detection' 
                                          : 'ATS-friendly layout'}
                                      </li>
                                      <li className="flex items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mr-2" />
                                        Optimized section structure
                                      </li>
                                      {template.isAtsOptimized && (
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
                                  
                                  <div className="pt-2">
                                    <Button 
                                      className="w-full"
                                      onClick={() => {
                                        handleSelectTemplate(template);
                                      }}
                                    >
                                      <Sparkles className="mr-2 h-4 w-4" /> Use This Template
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm"
                          className={selectedTemplate?.id === template.id ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          {selectedTemplate?.id === template.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5" /> Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {displayTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className={`flex border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer ${
                          selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="w-24 h-24 bg-muted/40 relative flex-shrink-0">
                          <img 
                            src={template.previewImage} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://placehold.co/200x200/f5f5f5/666666?text=Preview";
                            }}
                          />
                          {template.isAtsOptimized && (
                            <Badge 
                              className="absolute bottom-1 left-1 px-1 py-0 text-[10px] bg-green-500/90 hover:bg-green-500 text-white border-0"
                            >
                              ATS
                            </Badge>
                          )}
                        </div>
                        
                        <div className="p-3 flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-sm">{template.name}</h3>
                            {template.isPremium && (
                              <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 bg-amber-500/90 text-white border-0">
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {template.description}
                          </p>
                          
                          <div className="flex items-center mt-2 text-xs">
                            <span className="text-muted-foreground">ATS Score:</span>
                            <div className="w-16 h-1.5 bg-muted rounded-full ml-1 mr-1">
                              <div 
                                className={`h-full rounded-full ${
                                  template.isAtsOptimized
                                    ? 'bg-green-500' 
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${template.atsScore || (template.isAtsOptimized ? 95 : 80)}%` }}
                              ></div>
                            </div>
                            <span>{template.atsScore || (template.isAtsOptimized ? 95 : 80)}%</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.suitableFor.slice(0, 2).map((category, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">
                                {category}
                              </Badge>
                            ))}
                            {template.suitableFor.length > 2 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                +{template.suitableFor.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-3 flex items-center">
                          <div className="flex flex-col gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewTemplate(template);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" /> Preview
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
                                    <div className="space-y-4">
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
                                      
                                      <div className="pt-2">
                                        <Button 
                                          className="w-full"
                                          onClick={() => {
                                            handleSelectTemplate(template);
                                          }}
                                        >
                                          <Sparkles className="mr-2 h-4 w-4" /> Use This Template
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="sm"
                              className={`h-8 text-xs ${selectedTemplate?.id === template.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              onClick={() => handleSelectTemplate(template)}
                            >
                              {selectedTemplate?.id === template.id ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" /> Selected
                                </>
                              ) : (
                                'Select'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )
          )}
        </div>
      </CardContent>
      {displayTemplates.length > 0 && (
        <CardFooter className="border-t flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span>
              Showing {displayTemplates.length} template{displayTemplates.length !== 1 ? 's' : ''}
              {selectedIndustry !== 'all' || selectedCareerLevel !== 'all' ? ' (filtered)' : ''}
            </span>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
              <span>Advanced Filters</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TemplateSelector;