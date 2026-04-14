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
} from "./lesson.repository.js";
import { revalidateNextJs } from "../../utils/revalidate.js";


export async function getLesson({ id, slug }) {
  const lesson = await findLesson({ id, slug });
  if (!lesson) throw new Error("Lesson not found");
  return lesson;
}

export async function getLessons(args) {
  return findLessons(args);
}

export async function getRecentLessons(limit=5){
  return findRecentLessons(limit)
}

export async function getSidebarLessons(courseId) {
  return findSidebarLessons(courseId);
}

export async function createLessonService(input) {
  // const lesson = await createLesson({ ...input, course: input.course.id });
  const lesson = await createLesson(input);

  // trigger revalidation after create
  // await revalidateNextJs({
  //   type: 'lesson',
  //   slug: lesson.slug,
  //   courseSlug: input.course.slug,
  // });

  return lesson;
}

export async function updateLessonService(id, input) {
  const extra = {};
  if (input.isPublished === true) extra.publishedAt = new Date();

  const lesson = await updateLesson(id, { ...input, ...extra });

  // trigger revalidation after update
  // await revalidateNextJs({
  //   type: 'lesson',
  //   slug: lesson.slug,
  //   courseSlug: lesson.course?.name, // or slug if you populate it
  // });

  return lesson;
}

export async function deleteLessonService(id) {
  await softDeleteLesson(id);
  return {
    success: true,
    message: "Lesson deleted successfully",
    id,
  };
}

export async function restoreLessonService(id) {
  return restoreLesson(id);
}
 
export async function publishLessonService(id) {
  const lesson = await publishLesson(id);

  // most important — revalidate when a lesson goes live
  // await revalidateNextJs({
  //   type: 'lesson',
  //   slug: lesson.slug,
  //   courseSlug: lesson.course?.slug,
  // });

  return lesson;
}
 
export async function unpublishLessonService(id) {
  return unpublishLesson(id);
}