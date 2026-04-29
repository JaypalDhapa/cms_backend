// src/modules/course/course.model.js
// CHANGED:
//   1. order: Number → String (fractional index)
//   2. Added category field (ObjectId ref to Category)
//   3. Updated indexes

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
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
    // Reference to the category this course belongs to
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required:true,
      default: null,
      index: true,
    },
    // Fractional index string — ordered within its category
    order: {
      type: String,
      default: 'a0',
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({ category: 1, isDeleted: 1, order: 1 });
courseSchema.index({ isPublished: 1, order: 1 });

const Course = mongoose.model('Course', courseSchema);
export default Course;
