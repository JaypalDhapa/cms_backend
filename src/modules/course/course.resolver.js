import {
    getCourse,
    getCourses,
    createCourseService,
    updateCourseService,
    deleteCourseService,
    restoreCourseService,
  } from './course.service.js';
  
  const courseResolver = {
    Query: {
      course: (_parent, { id, slug }) => getCourse({ id, slug }),
      courses: (_parent, args) => getCourses(args),
    },
  
    Mutation: {
      createCourse: (_parent, { input }) => createCourseService(input),
      updateCourse: (_parent, { id, input }) => updateCourseService(id, input),
      deleteCourse: (_parent, { id }) => deleteCourseService(id),
      restoreCourse: (_parent, {id}) => restoreCourseService(id),
    },

    Course: {
      id: (parent) => parent._id?.toString() ?? parent.id,
    },
  };
  
  export default courseResolver;
  