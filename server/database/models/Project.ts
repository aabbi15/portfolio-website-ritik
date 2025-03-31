import mongoose, { Document, Schema } from 'mongoose';

// Project interface
export interface IProject extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string[];
  category: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Project schema
const ProjectSchema = new Schema<IProject>(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    imageUrl: { 
      type: String 
    },
    projectUrl: { 
      type: String 
    },
    githubUrl: { 
      type: String 
    },
    technologies: [{ 
      type: String 
    }],
    category: { 
      type: String, 
      default: 'other' 
    },
    featured: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true 
  }
);

// Project model
export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);