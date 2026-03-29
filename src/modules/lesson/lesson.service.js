import {
  findLesson,
  findLessons,
  findSidebarLessons,
  createLesson,
} from "./lesson.repository.js";

export async function getLesson({ id, slug }) {
  const lesson = await findLesson({ id, slug });
  if (!lesson) throw new Error("Lesson not found");
  return lesson;
}

export async function getLessons(args) {
  return findLessons(args);
}

export async function getSidebarLessons(courseId) {
  return findSidebarLessons(courseId);
}

export async function createLessonService(input) {
  return createLesson(input);
}
