import mongoose, { Document, Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  username: string;
  passwordHash: string;
  email?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String,
      trim: true,
      lowercase: true,
    },
    isAdmin: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true 
  }
);

// User model
export const UserModel = mongoose.model<IUser>('User', UserSchema);