export type Project = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: "web" | "ui" | "mobile";
  technologies: string[];
  tags: string[];
  link: string;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Recommendation Engine",
    description: "Developed a sophisticated recommendation system using deep learning to analyze user behavior and provide personalized suggestions.",
    image: "https://images.unsplash.com/photo-1555952494-efd681c7e3f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "web",
    technologies: ["Python", "TensorFlow", "Django", "PostgreSQL", "Redis"],
    tags: ["AI", "Backend", "Machine Learning"],
    link: "#",
  },
  {
    id: 2,
    title: "Distributed Microservices Architecture",
    description: "Designed and implemented a scalable microservices system with robust message queuing and service discovery.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "web",
    technologies: ["Node.js", "Express", "Docker", "Kubernetes", "RabbitMQ"],
    tags: ["Backend", "Microservices", "DevOps"],
    link: "#",
  },
  {
    id: 3,
    title: "Computer Vision Object Detection",
    description: "Built a real-time object detection system capable of identifying multiple objects in images and video streams with high accuracy.",
    image: "https://images.unsplash.com/photo-1581092921461-6dd24b6dd36e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "mobile",
    technologies: ["Python", "OpenCV", "YOLO", "PyTorch", "Flask"],
    tags: ["Computer Vision", "Deep Learning", "AI"],
    link: "#",
  },
  {
    id: 4,
    title: "Scalable API Gateway",
    description: "Created a high-performance API gateway with authentication, rate limiting, and analytics for a multi-tenant SaaS platform.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "web",
    technologies: ["Node.js", "Express", "MongoDB", "Redis", "JWT"],
    tags: ["Backend", "APIs", "Security"],
    link: "#",
  },
  {
    id: 5,
    title: "Natural Language Processing Assistant",
    description: "Developed an intelligent conversational AI assistant that understands context and provides meaningful responses to user queries.",
    image: "https://images.unsplash.com/photo-1673599252998-d1f0153b25d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "ui",
    technologies: ["Python", "NLTK", "Transformer Models", "FastAPI", "React"],
    tags: ["NLP", "Machine Learning", "Full Stack"],
    link: "#",
  },
  {
    id: 6,
    title: "Data Pipeline for Big Data Analytics",
    description: "Engineered a robust ETL pipeline handling millions of data points daily for real-time business intelligence dashboards.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "web",
    technologies: ["Apache Spark", "Kafka", "Airflow", "Python", "SQL"],
    tags: ["Data Engineering", "Big Data", "Backend"],
    link: "#",
  }
];
