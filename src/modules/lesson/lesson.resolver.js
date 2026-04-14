/*
import * as lessonServices from './lesson.service.js';
import data from '../../data/db.js'

const lessonResolver = {
    Query:{
        lessons: (parent,args) =>lessonServices.getLessons(args),
        // lesson: (parent,args) => lessonServices.getLessons(args)
    },

    // Mutation:{
    //     createLesson: (_,args) =>{
    //         console.log(args)
    //         return lessonServices.createLesson(args);
    //     }
    // }
}
*/
// export default lessonResolver

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
} from "./lesson.service.js";

const lessonResolver = {
  Query: {
    lesson: (_parent, { id, slug }) => getLesson({ id, slug }),
    lessons: (_parent, args) => getLessons(args),
    recentLessons: (_parent, { limit }) => getRecentLessons(limit),
    lessonSidebar: (_parent, { courseId }) => getSidebarLessons(courseId),
  },

  Mutation: {
    createLesson: (_parent, { input }) => createLessonService(input),
    updateLesson:(_parent,{id,input}) => updateLessonService(id,input),
    deleteLesson:(_parent, {id}) => deleteLessonService(id),
    restoreLesson: (_parent, { id }) => restoreLessonService(id),
    publishLesson: (_parent, { id }) => publishLessonService(id),
    unpublishLesson: (_parent, { id }) => unpublishLessonService(id),
  },

  Lesson: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },

  LessonCourse:{
    id:(parent) => parent._id?.toString() ?? parent.id,
  }
};

export default lessonResolver;

