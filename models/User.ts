// models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "CREATOR" | "CONSUMER";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  // Profile fields
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["CREATOR", "CONSUMER"], default: "CONSUMER" },
    // Profile fields
    username: { type: String, sparse: true, index: { unique: true, sparse: true } },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 150 },
    avatarUrl: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

// Pre-save hook to convert empty username to undefined (for sparse index)
UserSchema.pre('save', function(next) {
  if (this.username === '' || this.username === null) {
    this.username = undefined as any;
  }
  next();
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
