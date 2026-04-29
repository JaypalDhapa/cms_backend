// src/modules/lesson/lesson.service.js
// CHANGED:
//   1. createLessonService — passes section through (null = root level)
//   2. getSidebarLessons — updated to use new sidebar repo function

import {
  findLesson,
  findLessons,
  findSidebarLessons,
  findRecentLessons,
  createLesson,
  updateLesson,
  softDeleteLesson,
  restoreLesson,
  publishLesson,
  unpublishLesson,
} from './lesson.repository.js';

import { findCourse } from '../course/course.repository.js';

export async function getLesson({ id, slug }) {
  const lesson = await findLesson({ id, slug });
  if (!lesson) throw new Error('Lesson not found');
  return lesson;
}

export async function getLessons(args) {
  return findLessons(args);
}

export async function getSidebarLessons(courseId) {
  if (!courseId) throw new Error('courseId is required');
  return findSidebarLessons(courseId);
}

export async function getRecentLessons(limit) {
  return findRecentLessons(limit);
}

export async function createLessonService(input) {
  // section: null  → root level lesson
  // section: id    → lesson inside that section

  const course = await findCourse({ id: input.course });
  if (!course) throw new Error('Course not found');
 
  const fullSlug = `${course.slug}/${input.slug}`;

  const payload = {
    title: input.title,
    slug: input.slug,
    fullSlug,
    description: input.description,
    course: input.course,
    section: input.section ?? null,
    type: input.type ?? 'single',
    order: input.order ?? 'a0',
    content: input.content ?? '',
    isPublished: input.isPublished ?? false,
    meta: {
      title: input.meta?.title ?? input.title,
      description: input.meta?.description ?? input.description ?? '',
      keywords: input.meta?.keywords ?? [],
    },
  };

 

  try {
    return await createLesson(payload);
  } catch (err) {
    if (err.code === 11000) {
      console.log('DUPLICATE KEY ERROR:', err.keyValue);
      throw new Error(
        `A lesson with the slug "${input.slug}" already exists in this course`
      );
    }
    throw err;
  }
}

export async function updateLessonService(id, input) {
  const payload = {};

  if (input.title !== undefined) payload.title = input.title;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.fullSlug !== undefined) payload.fullSlug = input.fullSlug;
  if (input.description !== undefined) payload.description = input.description;
  if (input.course !== undefined) payload.course = input.course;
  if (input.type !== undefined) payload.type = input.type;
  if (input.order !== undefined) payload.order = input.order;
  if (input.content !== undefined) payload.content = input.content;
  if (input.isPublished !== undefined) payload.isPublished = input.isPublished;

  // Explicitly handle section:
  // undefined in input → don't touch section field
  // null in input      → move lesson to root level
  // string id in input → move lesson to that section
  if ('section' in input) {
    payload.section = input.section ?? null;
  }

  if (input.meta) {
    if (input.meta.title !== undefined) payload['meta.title'] = input.meta.title;
    if (input.meta.description !== undefined) payload['meta.description'] = input.meta.description;
    if (input.meta.keywords !== undefined) payload['meta.keywords'] = input.meta.keywords;
  }

  return updateLesson(id, payload);
}

export async function deleteLessonService(id) {
  const deleted = await softDeleteLesson(id);
  return {
    success: true,
    message: 'Lesson deleted successfully',
    id: deleted._id.toString(),
  };
}

export async function restoreLessonService(id) {
  return restoreLesson(id);
}

export async function publishLessonService(id) {
  return publishLesson(id);
}

export async function unpublishLessonService(id) {
  return unpublishLesson(id);
}
