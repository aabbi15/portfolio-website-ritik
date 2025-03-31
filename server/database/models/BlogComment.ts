import mongoose, { Document, Schema } from 'mongoose';

// BlogComment interface
export interface IBlogComment extends Document {
  postId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// BlogComment schema
const BlogCommentSchema = new Schema<IBlogComment>(
  {
    postId: { 
      type: Schema.Types.ObjectId, 
      ref: 'BlogPost',
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    isApproved: { 
      type: Boolean, 
      default: false 
    },
    parentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'BlogComment'
    }
  },
  { 
    timestamps: true 
  }
);

// BlogComment model
export const BlogCommentModel = mongoose.model<IBlogComment>('BlogComment', BlogCommentSchema);