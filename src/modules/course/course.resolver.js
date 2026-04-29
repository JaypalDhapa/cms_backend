// src/modules/course/course.resolver.js
// CHANGED:
//   1. Course type resolver — added category, sectionCount, lessonCount fields
//   2. CourseCategory sub-resolver for id mapping

import {
  getCourse,
  getCourses,
  createCourseService,
  updateCourseService,
  deleteCourseService,
  restoreCourseService,
} from './course.service.js';

import {
  countSectionsInCourse,
  countRootLessonsInCourse,
} from './course.repository.js';

const courseResolver = {
  Query: {
    course: (_parent, { id, slug }) => getCourse({ id, slug }),
    courses: (_parent, args) => getCourses(args),
  },

  Mutation: {
    createCourse: (_parent, { input }) => createCourseService(input),
    updateCourse: (_parent, { id, input }) => updateCourseService(id, input),
    deleteCourse: (_parent, { id }) => deleteCourseService(id),
    restoreCourse: (_parent, { id }) => restoreCourseService(id),
  },

  Course: {
    id: (parent) => parent._id?.toString() ?? parent.id,

    // Live count of non-deleted sections in this course
    sectionCount: async (parent) => {
      const id = parent._id?.toString() ?? parent.id;
      return countSectionsInCourse(id);
    },

    // Live count of root-level lessons (section: null) in this course
    lessonCount: async (parent) => {
      const id = parent._id?.toString() ?? parent.id;
      return countRootLessonsInCourse(id);
    },
  },

  CourseCategory: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },
};

export default courseResolver;
