// src/modules/section/section.repository.js

import Section from './section.model.js';
import Lesson from '../lesson/lesson.model.js';
import {
  parsePaginationArgs,
  buildMongoosePaginationQuery,
  buildConnection,
} from '../../utils/pagination.js';

function buildSectionFilter(filters = {}) {
  const filter = { isDeleted: filters.isDeleted ?? false };
  if (filters.courseId != null) filter.course = filters.courseId;
  if (filters.isPublished != null) filter.isPublished = filters.isPublished;
  return filter;
}

// ── GET ONE ───────────────────────────────────────────────────────────────────

export async function findSection({ id }) {
  if (!id) throw new Error('Provide section id');
  return Section.findOne({ _id: id, isDeleted: false })
    .populate('course', 'name _id')
    .lean();
}

// ── GET MANY (cursor-paginated) ───────────────────────────────────────────────

export async function findSections(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildSectionFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    cursor: pagination.cursor,
    sortField: 'order',
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount] = await Promise.all([
    Section.find(finalFilter)
      .sort(sort)
      .limit(pagination.limit + 1)
      .populate('course', 'name _id')
      .lean(),
    Section.countDocuments(baseFilter),
  ]);

  return buildConnection({
    docs,
    limit: pagination.limit,
    totalCount,
    sortField: 'order',
  });
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createSection(data) {
  const doc = await new Section(data).save();
  return Section.findById(doc._id).populate('course', 'name _id').lean();
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateSection(id, data) {
  const updated = await Section.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate('course', 'name _id')
    .lean();
  return updated;
}

// ── SOFT DELETE ───────────────────────────────────────────────────────────────

export async function softDeleteSection(id) {
  const result = await Section.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return !!result;
}

// ── RESTORE ───────────────────────────────────────────────────────────────────

export async function restoreSection(id) {
  const restored = await Section.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .populate('course', 'name _id')
    .lean();
  if (!restored) throw new Error('Section not found or not deleted');
  return restored;
}

// ── CHILD COUNT (for delete safety) ──────────────────────────────────────────

export async function countLessonsInSection(sectionId) {
  return Lesson.countDocuments({ section: sectionId, isDeleted: false });
}
