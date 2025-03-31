export type Experience = {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
  achievements: string[];
  category: "backend" | "frontend" | "ai-ml" | "devops" | "management";
  logo?: string;
};

export const experiences: Experience[] = [
  {
    id: 1,
    title: "Senior Backend Engineer",
    company: "TechInnovate Solutions",
    location: "San Francisco, CA",
    period: "2021 - Present",
    description: [
      "Lead backend development for microservices architecture in a distributed systems environment",
      "Design and implementation of RESTful APIs and GraphQL services for multiple client applications",
      "Optimize database performance and query optimization for high-traffic applications"
    ],
    technologies: ["Python", "Node.js", "GraphQL", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
    achievements: [
      "Reduced API response time by 60% through implementing efficient caching strategies",
      "Implemented CI/CD pipeline reducing deployment time from hours to minutes",
      "Led migration from monolithic architecture to microservices improving scalability"
    ],
    category: "backend",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=250&h=250&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Machine Learning Engineer",
    company: "DataSense AI",
    location: "Boston, MA",
    period: "2019 - 2021",
    description: [
      "Developed predictive models and recommendation systems using machine learning algorithms",
      "Created data pipelines for processing large-scale datasets and feature engineering",
      "Collaborated with product team to integrate ML models into production applications"
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "AWS SageMaker", "Apache Spark"],
    achievements: [
      "Built recommendation engine improving customer engagement by 40%",
      "Automated data cleaning processes saving 15 hours/week of manual work",
      "Published research paper on efficient model deployment in production environments"
    ],
    category: "ai-ml",
    logo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=250&h=250&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "FinTech Innovations",
    location: "New York, NY",
    period: "2017 - 2019",
    description: [
      "Developed secure payment processing systems and banking integrations",
      "Built scalable backend services handling over 100,000 transactions daily",
      "Implemented robust error handling and monitoring systems"
    ],
    technologies: ["Node.js", "Express", "MongoDB", "RabbitMQ", "Jest", "AWS Lambda"],
    achievements: [
      "Reduced system downtime by 99.9% through implementing fault-tolerant architecture",
      "Implemented fraud detection system that prevented over $2M in fraudulent transactions",
      "Developed automated testing framework covering 95% of codebase"
    ],
    category: "backend",
    logo: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=250&h=250&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudScale Systems",
    location: "Seattle, WA",
    period: "2016 - 2017",
    description: [
      "Managed cloud infrastructure and containerization for enterprise applications",
      "Implemented infrastructure as code using Terraform and CloudFormation",
      "Created monitoring and alerting systems for production environments"
    ],
    technologies: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "ELK Stack", "Prometheus"],
    achievements: [
      "Reduced cloud infrastructure costs by 35% through optimization",
      "Implemented zero-downtime deployment pipelines",
      "Created self-healing infrastructure reducing manual intervention by 80%"
    ],
    category: "devops",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=250&h=250&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Full Stack Developer",
    company: "WebSolutions Agency",
    location: "Chicago, IL",
    period: "2015 - 2016",
    description: [
      "Developed full-stack web applications for clients across various industries",
      "Implemented responsive frontend interfaces using modern JavaScript frameworks",
      "Created backend APIs and database schemas for application functionality"
    ],
    technologies: ["JavaScript", "React", "Node.js", "Express", "MySQL", "CSS/SASS"],
    achievements: [
      "Delivered 12 client projects ahead of schedule with 100% client satisfaction",
      "Implemented reusable component library reducing development time by 40%",
      "Mentored junior developers and conducted code reviews"
    ],
    category: "frontend",
    logo: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=250&h=250&auto=format&fit=crop"
  }
];