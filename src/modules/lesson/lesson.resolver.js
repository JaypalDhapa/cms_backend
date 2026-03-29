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
  createLessonService,
} from "./lesson.service.js";

const lessonResolver = {
  Query: {
    lesson: (_parent, { id, slug }) => getLesson({ id, slug }),
    lessons: (_parent, args) => getLessons(args),
    lessonSidebar: (_parent, { courseId }) => getSidebarLessons(courseId),
  },

  Mutation: {
    createLesson: (_parent, { input }) => createLessonService(input),
  },
};

export default lessonResolver;

