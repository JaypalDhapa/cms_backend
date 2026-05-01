import {
    findUserReactionOnPost,
    togglePostReaction,
    removePostReaction,
  } from "./reaction.repository.js";
  
  // Hardcoded userId — replace with ctx.user.id when auth is ready
  const HARDCODED_USER_ID = "user_hardcoded_001";
  
  export async function getMyReactionOnPost(postId, userId = HARDCODED_USER_ID) {
    return findUserReactionOnPost(userId, postId);
  }
  
  export async function reactToPostService(
    { postId, type },
    userId = HARDCODED_USER_ID
  ) {
    return togglePostReaction(userId, postId, type.toLowerCase());
  }
  
  export async function removeReactionFromPostService(
    postId,
    userId = HARDCODED_USER_ID
  ) {
    await removePostReaction(userId, postId);
    return true;
  }