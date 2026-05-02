import mongoose from "mongoose";
import {blogDB} from '../../config/connectDB.js'

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // only this stays required — auto-save won't fire without title
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true, // allows multiple docs with null/missing slug without unique conflict
    },
    fullSlug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    coverImageAlt: {
      type: String,
    },
    readTime: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [String],
    allowComments: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
      index: true,
    },
    engagement: {
      likeCount: { type: Number, default: 0 },
      dislikeCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
    },
    meta: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
      },
      keywords: [String],
    },
  },
  { timestamps: true }
);

const Post = blogDB.model("Post", PostSchema);
export default Post;