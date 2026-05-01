import {
    findAllCategories,
    findCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  } from "./blogCategory.repository.js";
  import Post from "../blog/post.model.js";
  
  export async function getCategories() {
    return findAllCategories();
  }
  
  export async function getCategory({ id, slug }) {
    const category = await findCategory({ id, slug });
    if (!category) throw new Error("Category not found");
    return category;
  }
  
  export async function createCategoryService(input) {
    return createCategory(input);
  }
  
  export async function updateCategoryService(id, input) {
    return updateCategory(id, input);
  }
  
  export async function deleteCategoryService(id) {
    await deleteCategory(id);
  
    // set categoryId to null on all posts that had this category
    await Post.updateMany(
      { categoryId: id },
      { $set: { categoryId: null } }
    );
  
    return true;
  }