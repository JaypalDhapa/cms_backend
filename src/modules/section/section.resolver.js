// src/modules/section/section.resolver.js

import {
  getSection,
  getSections,
  createSectionService,
  updateSectionService,
  deleteSectionService,
  restoreSectionService,
} from './section.service.js';

import Lesson from '../lesson/lesson.model.js';

const sectionResolver = {
  Query: {
    section: (_parent, { id }) => getSection({ id }),
    sections: (_parent, args) => getSections(args),
  },

  Mutation: {
    createSection: (_parent, { input }) => createSectionService(input),
    updateSection: (_parent, { id, input }) => updateSectionService(id, input),
    deleteSection: (_parent, { id }) => deleteSectionService(id),
    restoreSection: (_parent, { id }) => restoreSectionService(id),
  },

  Section: {
    id: (parent) => parent._id?.toString() ?? parent.id,

    // Live count of non-deleted lessons in this section
    lessonCount: async (parent) => {
      const id = parent._id?.toString() ?? parent.id;
      return Lesson.countDocuments({ section: id, isDeleted: false });
    },
  },

  SectionCourse: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },
};

export default sectionResolver;
