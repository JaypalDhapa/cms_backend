// src/modules/section/section.model.js

import mongoose from 'mongoose';
import { tutorialDB } from '../../config/connectDB.js';

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
     
    },
    // Fractional index string — ordered within its course
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

// Unique slug per course (only among non-deleted sections)
sectionSchema.index(
  { course: 1, slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $eq: false } } }
);

// Fast ordering within a course
sectionSchema.index({ course: 1, isDeleted: 1, order: 1 });

const Section = tutorialDB.model('Section', sectionSchema);
export default Section;
