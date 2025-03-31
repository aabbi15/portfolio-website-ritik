import mongoose, { Document, Schema } from 'mongoose';

// Testimonial interface
export interface ITestimonial extends Document {
  name: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Testimonial schema
const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { 
      type: String, 
      required: true 
    },
    position: { 
      type: String, 
      required: true 
    },
    company: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    avatar: { 
      type: String 
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5,
      default: 5
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

// Testimonial model
export const TestimonialModel = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);