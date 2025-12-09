import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  // legacy `content` field kept for compatibility; prefer `currentContent` and `draftContent`
  content?: string;
  contentFormat?: "markdown" | "novel";
  currentContent?: string;
  draftContent?: string;
  status: "draft" | "published" | "unpublished";
  authorId?: string;
  authorName?: string;
  authorProfile?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    currentContent: {
      type: String,
    },
    draftContent: {
      type: String,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
    },
    authorId: {
      type: String,
      index: true,
    },
    authorName: {
      type: String,
    },
    authorProfile: {
      type: String,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.virtual("id").get(function (this: IArticle) {
  // @ts-ignore - _id exists on documents
  return this._id?.toString();
});

ArticleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    (ret as any).id = (ret as any)._id;
    delete (ret as any)._id;
  },
});

ArticleSchema.set("toObject", { virtuals: true });

export const Article = mongoose.model<IArticle>("Article", ArticleSchema);
