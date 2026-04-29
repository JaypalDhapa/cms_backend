// src/modules/category/category.service.js

import {
  findCategory,
  findCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  countCoursesInCategory,
} from './category.repository.js';

export async function getCategory({ id, slug }) {
  const category = await findCategory({ id, slug });
  if (!category) throw new Error('Category not found');
  return category;
}

export async function getCategories(args) {
  return findCategories(args);
}

export async function createCategoryService(input) {
  try {
    return await createCategory(input);
  } catch (err) {
    if (err.code === 11000) {
      throw new Error(`A category with the name "${input.name}" already exists`);
    }
    throw err;
  }
}

export async function updateCategoryService(id, input) {
  const category = await updateCategory(id, input);
  if (!category) throw new Error('Category not found or already deleted');
  return category;
}

export async function deleteCategoryService(id) {
  // ── Safety check — cannot delete if it has courses ────────────────────────
  const courseCount = await countCoursesInCategory(id);
  if (courseCount > 0) {
    throw new Error(
      `Cannot delete this category — it has ${courseCount} course(s). Delete all courses first.`
    );
  }

  const deleted = await softDeleteCategory(id);
  if (!deleted) throw new Error('Category not found or already deleted');
  return { success: true, message: 'Category deleted successfully', id };
}

export async function restoreCategoryService(id) {
  return restoreCategory(id);
}
