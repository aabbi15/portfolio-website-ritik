import mongoose, { Document, Schema } from 'mongoose';

// BlogPost interface
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  category?: string;
  author: string;
  isPublished: boolean;
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// BlogPost schema
const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    excerpt: { 
      type: String 
    },
    coverImage: { 
      type: String 
    },
    tags: [{ 
      type: String 
    }],
    category: { 
      type: String 
    },
    author: { 
      type: String, 
      required: true 
    },
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    viewCount: { 
      type: Number, 
      default: 0 
    },
    publishedAt: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// BlogPost model
export const BlogPostModel = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);