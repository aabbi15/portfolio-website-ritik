import mongoose, { Document, Schema } from 'mongoose';

// Skill interface
export interface ISkill extends Document {
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  color?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Skill schema
const SkillSchema = new Schema<ISkill>(
  {
    name: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    proficiency: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100 
    },
    icon: { 
      type: String 
    },
    color: { 
      type: String 
    },
    featured: { 
      type: Boolean, 
      default: false 
    },
    order: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true 
  }
);

// Skill model
export const SkillModel = mongoose.model<ISkill>('Skill', SkillSchema);