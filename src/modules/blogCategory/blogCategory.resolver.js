import {
    getCategories,
    getCategory,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
  } from "./blogCategory.service.js";
  
  const blogCategoryResolver = {
    Query: {
      blogCategories: () => getCategories(),
      blogaCtegory: (_parent, { id, slug }) => getCategory({ id, slug }),
    },
  
    Mutation: {
      createBlogCategory: (_parent, { input }) => createCategoryService(input),
      updateBlogCategory: (_parent, { id, input }) => updateCategoryService(id, input),
      deleteBlogCategory: (_parent, { id }) => deleteCategoryService(id),
    },
  
    BlogCategory: {
      id: (parent) => parent._id?.toString() ?? parent.id,
    },
  };
  
  export default blogCategoryResolver;