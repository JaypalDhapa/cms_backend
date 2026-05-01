import {
    getMyReactionOnComment,
    reactToCommentService,
    removeReactionFromCommentService,
  } from "./commentReaction.service.js";
  
  const commentReactionResolver = {
    Query: {
      myReactionOnComment: (_parent, { commentId }) =>
        getMyReactionOnComment(commentId),
    },
  
    Mutation: {
      reactToComment: (_parent, { input }) => reactToCommentService(input),
      removeReactionFromComment: (_parent, { commentId }) =>
        removeReactionFromCommentService(commentId),
    },
  
    CommentReaction: {
      id: (parent) => parent._id?.toString() ?? parent.id,
    },
  };
  
  export default commentReactionResolver;