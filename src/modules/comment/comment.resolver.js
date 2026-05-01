import {
    getComments,
    createCommentService,
    updateCommentService,
    deleteCommentService,
  } from "./comment.service.js";
  
  const commentResolver = {
    Query: {
      comments: (_parent, args) => getComments(args),
    },
  
    Mutation: {
      createComment: (_parent, { input }) => createCommentService(input),
      updateComment: (_parent, { id, input }) => updateCommentService(id, input),
      deleteComment: (_parent, { id }) => deleteCommentService(id),
    },
  
    Comment: {
      id: (parent) => parent._id?.toString() ?? parent.id,
    },
  };
  
  export default commentResolver;