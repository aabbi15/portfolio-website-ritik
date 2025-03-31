import mongoose, { Document, Schema } from 'mongoose';

// Experience interface
export interface IExperience extends Document {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies: string[];
  achievements: string[];
  category: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Experience schema
const ExperienceSchema = new Schema<IExperience>(
  {
    title: { 
      type: String, 
      required: true 
    },
    company: { 
      type: String, 
      required: true 
    },
    location: { 
      type: String,
      required: true 
    },
    period: { 
      type: String, 
      required: true 
    },
    description: [{ 
      type: String 
    }],
    technologies: [{ 
      type: String 
    }],
    achievements: [{ 
      type: String 
    }],
    category: { 
      type: String, 
      default: 'professional' 
    },
    logo: { 
      type: String 
    }
  },
  { 
    timestamps: true 
  }
);

// Experience model
export const ExperienceModel = mongoose.model<IExperience>('Experience', ExperienceSchema);