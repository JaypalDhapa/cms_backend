// src/modules/category/category.resolver.js

import {
  getCategory,
  getCategories,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  restoreCategoryService,
} from './category.service.js';

import Course from '../course/course.model.js';

const categoryResolver = {
  Query: {
    category: (_parent, { id, slug }) => getCategory({ id, slug }),
    categories: (_parent, args) => getCategories(args),
  },

  Mutation: {
    createCategory: (_parent, { input }) => createCategoryService(input),
    updateCategory: (_parent, { id, input }) => updateCategoryService(id, input),
    deleteCategory: (_parent, { id }) => deleteCategoryService(id),
    restoreCategory: (_parent, { id }) => restoreCategoryService(id),
  },

  Category: {
    id: (parent) => parent._id?.toString() ?? parent.id,

    // Live count of non-deleted courses in this category
    courseCount: async (parent) => {
      const id = parent._id?.toString() ?? parent.id;
      return Course.countDocuments({ category: id, isDeleted: false });
    },
  },
};

export default categoryResolver;
