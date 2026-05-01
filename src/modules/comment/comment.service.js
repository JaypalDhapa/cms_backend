import {
    findComments,
    createComment,
    updateComment,
    softDeleteComment,
  } from "./comment.repository.js";
  
  // Hardcoded userId — replace with ctx.user.id when auth is ready
  const HARDCODED_USER_ID = "user_hardcoded_001";
  
  export async function getComments(args) {
    return findComments(args);
  }
  
  export async function createCommentService(input, userId = HARDCODED_USER_ID) {
    return createComment({ ...input, userId });
  }
  
  export async function updateCommentService(id, input) {
    return updateComment(id, input);
  }
  
  export async function deleteCommentService(id) {
    return softDeleteComment(id);
  }