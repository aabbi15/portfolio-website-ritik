export type Testimonial = {
  id: number;
  name: string;
  position: string;
  company: string;
  image: string;
  text: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "CTO",
    company: "TechVision Inc.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    text: "Working with Ritik on our AI-powered recommendation engine was incredible. His deep understanding of backend systems and machine learning algorithms helped us increase user engagement by 40%."
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Product Lead",
    company: "DataSmart Solutions",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    text: "Ritik's expertise in crafting scalable APIs and optimizing database performance was essential to our platform's success. His solutions handle millions of requests daily without breaking a sweat."
  },
  {
    id: 3,
    name: "Amanda Rodriguez",
    position: "CEO",
    company: "Innovate AI",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    text: "We hired Ritik to architect our machine learning pipeline, and the results exceeded our expectations. His ability to translate complex technical concepts into practical solutions is remarkable."
  }
];