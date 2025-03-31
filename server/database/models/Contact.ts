import mongoose, { Document, Schema } from 'mongoose';

// Contact interface
export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

// Contact schema
const ContactSchema = new Schema<IContact>(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    subject: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    timestamps: true 
  }
);

// Contact model
export const ContactModel = mongoose.model<IContact>('Contact', ContactSchema);