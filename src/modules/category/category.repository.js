// src/modules/category/category.repository.js

import Category from './category.model.js';
import Course from '../course/course.model.js';
import {
  parsePaginationArgs,
  buildMongoosePaginationQuery,
  buildConnection,
} from '../../utils/pagination.js';

function buildCategoryFilter(filters = {}) {
  const filter = { isDeleted: filters.isDeleted ?? false };
  if (filters.isPublished != null) filter.isPublished = filters.isPublished;
  return filter;
}

// ── GET ONE ───────────────────────────────────────────────────────────────────

export async function findCategory({ id, slug }) {
  if (!id && !slug) throw new Error('Provide id or slug');
  return Category.findOne({
    ...(id ? { _id: id } : { slug }),
    isDeleted: false,
  }).lean();
}

// ── GET MANY (cursor-paginated) ───────────────────────────────────────────────

export async function findCategories(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildCategoryFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    cursor: pagination.cursor,
    sortField: 'order',
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount] = await Promise.all([
    Category.find(finalFilter)
      .sort(sort)
      .limit(pagination.limit + 1)
      .lean(),
    Category.countDocuments(baseFilter),
  ]);

  return buildConnection({
    docs,
    limit: pagination.limit,
    totalCount,
    sortField: 'order',
  });
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createCategory(data) {
  return new Category(data).save();
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateCategory(id, data) {
  const updated = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  return updated;
}

// ── SOFT DELETE ───────────────────────────────────────────────────────────────

export async function softDeleteCategory(id) {
  const result = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return !!result;
}

// ── RESTORE ───────────────────────────────────────────────────────────────────

export async function restoreCategory(id) {
  const restored = await Category.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  ).lean();
  if (!restored) throw new Error('Category not found or not deleted');
  return restored;
}

// ── CHILD COUNT (for delete safety) ──────────────────────────────────────────

export async function countCoursesInCategory(categoryId) {
  return Course.countDocuments({ category: categoryId, isDeleted: false });
}
