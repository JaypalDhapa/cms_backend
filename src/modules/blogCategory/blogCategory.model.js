import mongoose from "mongoose";

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

const BlogCategory = mongoose.model("BlogCategory", BlogCategorySchema);
export default BlogCategory;