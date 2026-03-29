import {
  findCourse,
  findCourses,
  createCourse,
  updateCourse,
  softDeleteCourse,
  restoreCourse,
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
  return createCourse(input);
}

export async function updateCourseService(id, input) {
  const course = await updateCourse(id, input);
  if (!course) throw new Error('Course not found or already deleted');
  return course;
}

export async function deleteCourseService(id) {
  const deleted = await softDeleteCourse(id);
  if (!deleted) throw new Error('Course not found or already deleted');
  return true;
}

export async function restoreCourseService(id) {
  return restoreCourse(id);
}