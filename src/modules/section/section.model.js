// src/modules/section/section.model.js

import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Reference to the course this section belongs to (required)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
      index: true,
    },
    // Fractional index string — ordered within its course
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

// Unique slug per course
sectionSchema.index({ course: 1, slug: 1 }, { unique: true });

// Fast ordering within a course
sectionSchema.index({ course: 1, isDeleted: 1, order: 1 });

const Section = mongoose.model('Section', sectionSchema);
export default Section;
