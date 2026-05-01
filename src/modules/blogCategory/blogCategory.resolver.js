import {
    getCategories,
    getCategory,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
  } from "./blogCategory.service.js";
  
  const blogCategoryResolver = {
    Query: {
      categories: () => getCategories(),
      category: (_parent, { id, slug }) => getCategory({ id, slug }),
    },
  
    Mutation: {
      createCategory: (_parent, { input }) => createCategoryService(input),
      updateCategory: (_parent, { id, input }) => updateCategoryService(id, input),
      deleteCategory: (_parent, { id }) => deleteCategoryService(id),
    },
  
    BlogCategory: {
      id: (parent) => parent._id?.toString() ?? parent.id,
    },
  };
  
  export default blogCategoryResolver;