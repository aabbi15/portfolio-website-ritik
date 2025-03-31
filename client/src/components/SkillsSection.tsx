import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaBrain, FaServer, FaDesktop, FaTools, FaDatabase, FaCloud } from 'react-icons/fa';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import SkillRadar from '@/components/ui/SkillRadar';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { SiPython, SiJavascript, SiTypescript, SiNodedotjs, SiExpress, SiReact, 
  SiTensorflow, SiPytorch, SiDocker, SiKubernetes, SiPostgresql, SiMongodb, 
  SiAmazon, SiOpenai } from 'react-icons/si';

type Skill = {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  yearsExperience?: string;
};

// Color palette for different skill categories
const categoryColors: Record<string, string> = {
  'ai-ml': 'rgba(255, 87, 51, 0.9)', // Coral red
  'backend': 'rgba(30, 144, 255, 0.9)', // Dodger blue
  'frontend': 'rgba(106, 90, 205, 0.9)', // Slate blue
  'devops': 'rgba(255, 165, 0, 0.9)', // Orange
  'database': 'rgba(50, 205, 50, 0.9)', // Lime green
  'cloud': 'rgba(75, 0, 130, 0.9)', // Indigo
};

const iconMap: Record<string, React.ReactNode> = {
  'ai-ml': <FaBrain className="h-5 w-5" />,
  'backend': <FaServer className="h-5 w-5" />,
  'frontend': <FaDesktop className="h-5 w-5" />,
  'devops': <FaTools className="h-5 w-5" />,
  'database': <FaDatabase className="h-5 w-5" />,
  'cloud': <FaCloud className="h-5 w-5" />,
};

const techIconMap: Record<string, React.ReactNode> = {
  'Python': <SiPython />,
  'JavaScript': <SiJavascript />,
  'TypeScript': <SiTypescript />,
  'Node.js': <SiNodedotjs />,
  'Express': <SiExpress />,
  'React': <SiReact />,
  'TensorFlow': <SiTensorflow />,
  'PyTorch': <SiPytorch />,
  'Docker': <SiDocker />,
  'Kubernetes': <SiKubernetes />,
  'PostgreSQL': <SiPostgresql />,
  'MongoDB': <SiMongodb />,
  'AWS': <SiAmazon />,
  'NLP': <SiOpenai />,
};

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [animated, setAnimated] = useState(false);
  const [displayMode, setDisplayMode] = useState<'cards' | 'radar'>('cards');
  
  const { data: skills, isLoading } = useQuery({
    queryKey: ['/api/skills'],
    queryFn: async () => {
      // For now, return mock data since we haven't implemented the API endpoint yet
      return [
        { id: 1, name: 'Python', category: 'backend', proficiency: 90, yearsExperience: '5+ years' },
        { id: 2, name: 'JavaScript', category: 'frontend', proficiency: 85, yearsExperience: '4+ years' },
        { id: 3, name: 'TypeScript', category: 'frontend', proficiency: 80, yearsExperience: '3+ years' },
        { id: 4, name: 'Node.js', category: 'backend', proficiency: 85, yearsExperience: '4+ years' },
        { id: 5, name: 'Express', category: 'backend', proficiency: 85, yearsExperience: '4+ years' },
        { id: 6, name: 'React', category: 'frontend', proficiency: 80, yearsExperience: '3+ years' },
        { id: 7, name: 'TensorFlow', category: 'ai-ml', proficiency: 75, yearsExperience: '2+ years' },
        { id: 8, name: 'PyTorch', category: 'ai-ml', proficiency: 70, yearsExperience: '2+ years' },
        { id: 9, name: 'Docker', category: 'devops', proficiency: 75, yearsExperience: '3+ years' },
        { id: 10, name: 'Kubernetes', category: 'devops', proficiency: 65, yearsExperience: '2+ years' },
        { id: 11, name: 'PostgreSQL', category: 'database', proficiency: 80, yearsExperience: '4+ years' },
        { id: 12, name: 'MongoDB', category: 'database', proficiency: 75, yearsExperience: '3+ years' },
        { id: 13, name: 'AWS', category: 'cloud', proficiency: 70, yearsExperience: '2+ years' },
        { id: 14, name: 'NLP', category: 'ai-ml', proficiency: 75, yearsExperience: '2+ years' },
        { id: 15, name: 'REST API', category: 'backend', proficiency: 90, yearsExperience: '5+ years' },
      ] as Skill[];
    },
  });

  // Animate progress bars when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('skills-section');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [animated]);

  // Get unique categories for tabs
  const categories = skills 
    ? ['all', ...Array.from(new Set(skills.map(skill => skill.category)))]
    : ['all'];

  // Filter skills by category
  const filteredSkills = skills 
    ? (activeCategory === 'all' 
        ? skills 
        : skills.filter(skill => skill.category === activeCategory))
    : [];

  // Prepare skills data for radar chart
  const radarSkills = filteredSkills
    .slice(0, 8) // Limit to 8 skills for radar chart readability
    .map(skill => ({
      name: skill.name,
      value: skill.proficiency,
      color: categoryColors[skill.category] || 'rgba(99, 102, 241, 0.9)' // Default indigo if category not found
    }));

  return (
    <section id="skills-section" className="py-10 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal from="bottom" delay={0.1}>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Skills & Expertise</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Explore my technical proficiencies across various domains, from backend development to machine learning and cloud technologies.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal from="bottom" delay={0.2} width="100%">
          <div className="flex flex-col items-center mb-6">
            <div className="flex space-x-2 mb-6">
              <Button 
                variant={displayMode === 'cards' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setDisplayMode('cards')}
                className="rounded-l-md rounded-r-none"
              >
                Cards
              </Button>
              <Button 
                variant={displayMode === 'radar' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setDisplayMode('radar')}
                className="rounded-l-none rounded-r-md"
              >
                Radar Chart
              </Button>
            </div>

            <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-xs sm:max-w-2xl md:max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 mb-6 sm:mb-8 skill-tabs">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-1.5 sm:py-2">All</TabsTrigger>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="text-xs sm:text-sm flex items-center gap-1 px-2 py-1.5 sm:py-2"
                  >
                    {iconMap[category] || null}
                    <span className="hidden sm:inline">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-4 overflow-hidden">
                {displayMode === 'radar' ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[350px] w-full">
                        <Skeleton className="h-[300px] w-[300px] rounded-full" />
                      </div>
                    ) : (
                      <div className="relative">
                        <SkillRadar skills={radarSkills} size={350} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                            {iconMap[activeCategory] || (
                              <span className="text-2xl font-bold text-primary">
                                {filteredSkills.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                      {!isLoading && filteredSkills.slice(0, 8).map((skill) => (
                        <motion.div
                          key={skill.id}
                          className="flex items-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: skill.id * 0.05 }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[skill.category] }} />
                          <span className="flex items-center gap-1">
                            <span className="text-lg">
                              {techIconMap[skill.name] || null}
                            </span>
                            {skill.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 overflow-hidden">
                    {isLoading ? (
                      // Skeleton loader
                      Array(6).fill(0).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-3 sm:p-4">
                            <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 mb-2" />
                            <Skeleton className="h-3 sm:h-4 w-full mb-3 sm:mb-4" />
                            <Skeleton className="h-1.5 sm:h-2 w-full" />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      filteredSkills.map((skill) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: skill.id * 0.05 }}
                        >
                          <Card className="overflow-hidden transition-all hover:shadow-md">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex justify-between items-center mb-1 sm:mb-2">
                                <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
                                  <span className="text-lg text-primary">
                                    {techIconMap[skill.name] || null}
                                  </span>
                                  {skill.name}
                                </h3>
                                <span className="text-xs sm:text-sm text-muted-foreground">{skill.yearsExperience}</span>
                              </div>
                              <div className="mb-1 flex justify-between items-center text-xs">
                                <span className="inline-flex items-center">
                                  {iconMap[skill.category] && (
                                    <span className="mr-1">{iconMap[skill.category]}</span>
                                  )}
                                  <span className="capitalize">{skill.category}</span>
                                </span>
                                <span>{skill.proficiency}%</span>
                              </div>
                              <Progress 
                                value={animated ? skill.proficiency : 0} 
                                className="h-1.5 sm:h-2 bg-muted/50"
                                style={{
                                  transitionProperty: 'width',
                                  transitionDuration: '1s',
                                  transitionTimingFunction: 'ease-out',
                                  transitionDelay: `${skill.id * 0.05}s`
                                }}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}