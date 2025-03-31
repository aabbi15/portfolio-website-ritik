export type Skill = {
  name: string;
  icon: string;
  level: "Expert" | "Advanced" | "Intermediate" | "Beginner";
  category: "Backend" | "Frontend" | "AI/ML" | "DevOps" | "Databases";
  experience: string;
  description: string;
  color: string;
};

export const skills: Skill[] = [
  {
    name: "Python",
    icon: "ri-python-line",
    level: "Expert",
    category: "Backend",
    experience: "6+ years",
    description: "Django, Flask, FastAPI, Data Analysis",
    color: "from-blue-500 to-blue-700"
  },
  {
    name: "Machine Learning",
    icon: "ri-brain-line",
    level: "Advanced",
    category: "AI/ML",
    experience: "4+ years",
    description: "Scikit-learn, TensorFlow, Computer Vision",
    color: "from-purple-500 to-purple-700"
  },
  {
    name: "Node.js",
    icon: "ri-nodejs-line",
    level: "Expert",
    category: "Backend",
    experience: "5+ years",
    description: "Express, REST APIs, Microservices",
    color: "from-green-500 to-green-700"
  },
  {
    name: "SQL & NoSQL",
    icon: "ri-database-2-line",
    level: "Advanced",
    category: "Databases",
    experience: "6+ years",
    description: "PostgreSQL, MongoDB, Redis, Data Modeling",
    color: "from-cyan-500 to-cyan-700"
  },
  {
    name: "Deep Learning",
    icon: "ri-robot-line",
    level: "Advanced",
    category: "AI/ML",
    experience: "3+ years",
    description: "Neural Networks, NLP, PyTorch",
    color: "from-indigo-500 to-indigo-700"
  },
  {
    name: "API Development",
    icon: "ri-code-s-slash-line",
    level: "Expert",
    category: "Backend",
    experience: "6+ years",
    description: "RESTful, GraphQL, API Gateways",
    color: "from-yellow-500 to-yellow-700" 
  },
  {
    name: "React & JavaScript",
    icon: "ri-reactjs-line",
    level: "Intermediate",
    category: "Frontend",
    experience: "3+ years",
    description: "Modern JavaScript, TypeScript, React",
    color: "from-sky-500 to-sky-700"
  },
  {
    name: "DevOps & Cloud",
    icon: "ri-cloud-line",
    level: "Intermediate",
    category: "DevOps",
    experience: "3+ years",
    description: "AWS, Docker, CI/CD, Kubernetes",
    color: "from-orange-500 to-orange-700"
  }
];
