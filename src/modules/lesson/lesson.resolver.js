// src/modules/lesson/lesson.resolver.js
// CHANGED:
//   1. Added LessonSection sub-resolver for id mapping
//   2. lessonSidebar resolver now returns SidebarData type (sections + rootLessons)
//   3. All other resolvers unchanged

import {
  getLesson,
  getLessons,
  getSidebarLessons,
  getRecentLessons,
  createLessonService,
  updateLessonService,
  deleteLessonService,
  restoreLessonService,
  publishLessonService,
  unpublishLessonService,
} from './lesson.service.js';

const lessonResolver = {
  Query: {
    lesson: (_parent, { id, slug }) => getLesson({ id, slug }),
    lessons: (_parent, args) => getLessons(args),
    recentLessons: (_parent, { limit }) => getRecentLessons(limit),
    lessonSidebar: (_parent, { courseId }) => getSidebarLessons(courseId),
  },

  Mutation: {
    createLesson: (_parent, { input }) => createLessonService(input),
    updateLesson: (_parent, { id, input }) => updateLessonService(id, input),
    deleteLesson: (_parent, { id }) => deleteLessonService(id),
    restoreLesson: (_parent, { id }) => restoreLessonService(id),
    publishLesson: (_parent, { id }) => publishLessonService(id),
    unpublishLesson: (_parent, { id }) => unpublishLessonService(id),
  },

  Lesson: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },

  LessonCourse: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },

  // New — resolves the section sub-object on a Lesson
  LessonSection: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },

  // New — resolves sidebar section items (sections with nested lessons)
  SidebarSection: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },

  SidebarLesson: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },
};

export default lessonResolver;
