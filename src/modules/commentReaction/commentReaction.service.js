import {
    findUserReactionOnComment,
    toggleCommentReaction,
    removeCommentReaction,
  } from "./commentReaction.repository.js";
  
  // Hardcoded userId — replace with ctx.user.id when auth is ready
  const HARDCODED_USER_ID = "user_hardcoded_001";
  
  export async function getMyReactionOnComment(
    commentId,
    userId = HARDCODED_USER_ID
  ) {
    return findUserReactionOnComment(userId, commentId);
  }
  
  export async function reactToCommentService(
    { commentId, type },
    userId = HARDCODED_USER_ID
  ) {
    return toggleCommentReaction(userId, commentId, type.toLowerCase());
  }
  
  export async function removeReactionFromCommentService(
    commentId,
    userId = HARDCODED_USER_ID
  ) {
    await removeCommentReaction(userId, commentId);
    return true;
  }