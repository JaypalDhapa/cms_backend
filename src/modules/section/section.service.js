// src/modules/section/section.service.js

import {
  findSection,
  findSections,
  createSection,
  updateSection,
  softDeleteSection,
  restoreSection,
  countLessonsInSection,
} from './section.repository.js';

export async function getSection({ id }) {
  const section = await findSection({ id });
  if (!section) throw new Error('Section not found');
  return section;
}

export async function getSections(args) {
  return findSections(args);
}

export async function createSectionService(input) {
  try {
    const { courseId, ...rest } = input;
    const payload = { ...rest, course: courseId };

    return await createSection(payload);
  } catch (err) {
    if (err.code === 11000) {
      throw new Error(
        `A section with the slug "${input.slug}" already exists in this course`
      );
    }
    throw err;
  }
}

export async function updateSectionService(id, input) {
  const section = await updateSection(id, input);
  if (!section) throw new Error('Section not found or already deleted');
  return section;
}

export async function deleteSectionService(id) {
  // ── Safety check — cannot delete if it has lessons ────────────────────────
  const lessonCount = await countLessonsInSection(id);
  if (lessonCount > 0) {
    throw new Error(
      `Cannot delete this section — it has ${lessonCount} lesson(s). Delete all lessons first.`
    );
  }

  const deleted = await softDeleteSection(id);
  if (!deleted) throw new Error('Section not found or already deleted');
  return { success: true, message: 'Section deleted successfully', id };
}

export async function restoreSectionService(id) {
  return restoreSection(id);
}
