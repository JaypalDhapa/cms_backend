import {
  findLesson,
  findLessons,
  findSidebarLessons,
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

export async function getSidebarLessons(courseId) {
  return findSidebarLessons(courseId);
}

export async function createLessonService(input) {
  const lesson = await createLesson({ ...input, course: input.course.id });

  // trigger revalidation after create
  // await revalidateNextJs({
  //   type: 'lesson',
  //   slug: lesson.slug,
  //   courseSlug: input.course.slug,
  // });

  return lesson;
}

export async function updateLessonService(id,input){
  // handle publishedAt when isPublished is being set to true
  const extra = {};
  if (input.isPublished === true) {
    extra.publishedAt = new Date();
  }
 
  return updateLesson(id, { ...input, ...extra });
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
  return publishLesson(id);
}
 
export async function unpublishLessonService(id) {
  return unpublishLesson(id);
}