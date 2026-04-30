// src/modules/quiz/quiz.repository.js

import QuizQuestion from './quiz.model.js';
import {
  parsePaginationArgs,
  buildMongoosePaginationQuery,
  buildConnection,
} from '../../utils/pagination.js';

// ── Filter builder ────────────────────────────────────────────────────────────

function buildQuizFilter(filters = {}) {
  const filter = {};
  if (filters.lessonId != null) filter.lesson = filters.lessonId;
  return filter;
}

// ── GET ONE ───────────────────────────────────────────────────────────────────

export async function findQuizQuestion(id) {
  return QuizQuestion.findById(id).lean();
}

// ── GET MANY (cursor-paginated, ordered by order field) ───────────────────────

export async function findQuizQuestions(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildQuizFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    cursor: pagination.cursor,
    sortField: 'order',
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount] = await Promise.all([
    QuizQuestion.find(finalFilter)
      .sort(sort)
      .limit(pagination.limit + 1)
      .lean(),
    QuizQuestion.countDocuments(baseFilter),
  ]);

  return buildConnection({
    docs,
    limit: pagination.limit,
    totalCount,
    sortField: 'order',
  });
}

// ── GET ALL FOR LESSON (no pagination — used by frontend quiz player) ─────────
// Returns all questions for a lesson sorted by order ascending

export async function findAllQuizQuestionsByLesson(lessonId) {
  return QuizQuestion.find({ lesson: lessonId })
    .sort({ order: 1 })
    .lean();
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createQuizQuestion(data) {
  const doc = await new QuizQuestion(data).save();
  return QuizQuestion.findById(doc._id).lean();
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateQuizQuestion(id, data) {
  return QuizQuestion.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
}

// ── HARD DELETE ───────────────────────────────────────────────────────────────
// Quiz questions are hard-deleted (no soft delete needed)

export async function deleteQuizQuestion(id) {
  const result = await QuizQuestion.findByIdAndDelete(id);
  return !!result;
}

// ── ORDER HELPERS ─────────────────────────────────────────────────────────────

// Get the last order value for a lesson — used to calculate "last" position
export async function getLastOrderForLesson(lessonId) {
  const last = await QuizQuestion.findOne({ lesson: lessonId })
    .sort({ order: -1 })
    .select('order')
    .lean();
  return last?.order ?? -10; // returns -10 so first question gets order 0
}

// Get the first order value for a lesson — used to calculate "first" position
export async function getFirstOrderForLesson(lessonId) {
  const first = await QuizQuestion.findOne({ lesson: lessonId })
    .sort({ order: 1 })
    .select('order')
    .lean();
  return first?.order ?? 10; // returns 10 so new first question gets order 0
}

// Get all existing orders for a lesson — shown as hint in CMS custom order UI
export async function getOrdersForLesson(lessonId) {
  const docs = await QuizQuestion.find({ lesson: lessonId })
    .sort({ order: 1 })
    .select('order')
    .lean();
  return docs.map((d) => d.order);
}

// Count questions in a lesson
export async function countQuizQuestionsInLesson(lessonId) {
  return QuizQuestion.countDocuments({ lesson: lessonId });
}