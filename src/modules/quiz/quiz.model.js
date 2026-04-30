// src/modules/quiz/quiz.model.js

import mongoose from 'mongoose';
import { tutorialDB } from '../../config/connectDB.js';

// ── BlankAnswer sub-schema (used by fill_blank type) ──────────────────────────
const blankAnswerSchema = new mongoose.Schema(
  {
    acceptedAnswers: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false }
);

// ── Quiz Question schema ───────────────────────────────────────────────────────
const quizQuestionSchema = new mongoose.Schema(
  {
    // Reference to the lesson this question belongs to
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },

    // Question type — one of four supported types
    type: {
      type: String,
      required: true,
      enum: ['mcq', 'multi_select', 'drag_drop', 'fill_blank'],
    },

    // Question text — contains [blank] markers for drag_drop and fill_blank
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Explanation shown after learner submits (all types)
    explanation: {
      type: String,
      default: null,
      trim: true,
    },

    // All options/chips shown to learner
    // Used by: mcq, multi_select, drag_drop
    options: {
      type: [String],
      default: undefined,
    },

    // Correct answer — stored as JSON string to handle:
    //   mcq          → JSON.stringify("<p>")           → '"<p>"'
    //   multi_select → JSON.stringify(["<h1>","<h2>"]) → '["<h1>","<h2>"]'
    //   drag_drop    → JSON.stringify(["src","url"])   → '["src","url"]'
    //   fill_blank   → not used (blanks array used instead)
    correct: {
      type: String,
      default: null,
    },

    // Per-blank accepted answers — used by fill_blank only
    blanks: {
      type: [blankAnswerSchema],
      default: undefined,
    },

    // Local order within lesson — gap-based (0, 10, 20 …)
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
quizQuestionSchema.index({ lesson: 1, order: 1 });
quizQuestionSchema.index({ lesson: 1, type: 1 });

const QuizQuestion = tutorialDB.model('QuizQuestion', quizQuestionSchema);
export default QuizQuestion;