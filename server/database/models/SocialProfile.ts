import mongoose, { Document, Schema } from 'mongoose';

// SocialProfile interface
export interface ISocialProfile extends Document {
  platform: string;
  username: string;
  url: string;
  icon: string;
  display: boolean;
  order: number;
  followers?: number;
  lastSynced?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// SocialProfile schema
const SocialProfileSchema = new Schema<ISocialProfile>(
  {
    platform: { 
      type: String, 
      required: true,
      unique: true 
    },
    username: { 
      type: String, 
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    icon: { 
      type: String, 
      required: true 
    },
    display: { 
      type: Boolean, 
      default: true 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    followers: { 
      type: Number 
    },
    lastSynced: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// SocialProfile model
export const SocialProfileModel = mongoose.model<ISocialProfile>('SocialProfile', SocialProfileSchema);