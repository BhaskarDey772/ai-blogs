import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id field and JSON/Obj transforms
UserSchema.virtual("id").get(function (this: IUser) {
  return this._id?.toString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
  },
});

UserSchema.set("toObject", { virtuals: true });

export const User = mongoose.model<IUser>("User", UserSchema);
