// src/modules/category/category.model.js

import mongoose from 'mongoose';
import { tutorialDB } from '../../config/connectDB.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Fractional index string — e.g. "a0", "a1", "b0"
    // Allows infinite insertions between any two items without rebalancing
    order: {
      type: String,
      default: 'a0',
    },
    isPublished: {
      type: Boolean,
      default: false,
  
    },
    isDeleted: {
      type: Boolean,
      default: false,
  
    },
  },
  { timestamps: true }
);

categorySchema.index({ isDeleted: 1, order: 1 });

const Category = tutorialDB.model('Category', categorySchema);
export default Category;
