// src/modules/course/course.service.js
// CHANGED:
//   1. deleteCourseService — safety check before delete
//      blocks if course has sections OR root-level lessons

import {
  findCourse,
  findCourses,
  createCourse,
  updateCourse,
  softDeleteCourse,
  restoreCourse,
  countSectionsInCourse,
  countRootLessonsInCourse,
} from './course.repository.js';

export async function getCourse({ id, slug }) {
  const course = await findCourse({ id, slug });
  if (!course) throw new Error('Course not found');
  return course;
}

export async function getCourses(args) {
  return findCourses(args);
}

export async function createCourseService(input) {
  try {
    const payload = {
      ...input,
      category:input.categoryId,
    }
    return await createCourse(payload);
  } catch (err) {
    if (err.code === 11000) {
      throw new Error(`A course with the name "${input.name}" already exists`);
    }
    throw err;
  }
}

export async function updateCourseService(id, input) {
  const course = await updateCourse(id, input);
  if (!course) throw new Error('Course not found or already deleted');
  return course;
}

export async function deleteCourseService(id) {
  // ── Safety check — cannot delete if it has sections or root-level lessons ──
  const [sectionCount, rootLessonCount] = await Promise.all([
    countSectionsInCourse(id),
    countRootLessonsInCourse(id),
  ]);

  const totalChildren = sectionCount + rootLessonCount;
  if (totalChildren > 0) {
    throw new Error(
      `Cannot delete this course — it has ${sectionCount} section(s) and ${rootLessonCount} root-level lesson(s). Remove them all first.`
    );
  }

  const deleted = await softDeleteCourse(id);
  if (!deleted) throw new Error('Course not found or already deleted');
  return { success: true, message: 'Course deleted successfully', id };
}

export async function restoreCourseService(id) {
  return restoreCourse(id);
}
