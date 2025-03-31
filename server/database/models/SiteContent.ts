import mongoose, { Document, Schema } from 'mongoose';

// SiteContent interface
export interface ISiteContent extends Document {
  section: string;
  key: string;
  value: string;
  type: string;
  updatedAt: Date;
}

// SiteContent schema
const SiteContentSchema = new Schema<ISiteContent>(
  {
    section: { 
      type: String, 
      required: true 
    },
    key: { 
      type: String, 
      required: true 
    },
    value: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      default: 'text' 
    }
  },
  { 
    timestamps: true 
  }
);

// Compound index to ensure section:key uniqueness
SiteContentSchema.index({ section: 1, key: 1 }, { unique: true });

// SiteContent model
export const SiteContentModel = mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);