import mongoose from "mongoose";
import {blogDB} from '../../config/connectDB.js'


const BlogCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const BlogCategory = blogDB.model("BlogCategory", BlogCategorySchema);
export default BlogCategory;