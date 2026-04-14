import {
  findCourse,
  findCourses,
  createCourse,
  updateCourse,
  softDeleteCourse,
  restoreCourse,
} from './course.repository.js';

import { revalidateNextJs } from '../../utils/revalidate.js';

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
    return await createCourse(input);
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

  // await revalidateNextJs({ type: 'course', slug: course.slug });
  return course;
}

export async function deleteCourseService(id) {
  const deleted = await softDeleteCourse(id);
  if (!deleted) throw new Error('Course not found or already deleted');
  return { success: true, message: 'Course deleted successfully', id };
}

export async function restoreCourseService(id) {
  return restoreCourse(id);
}