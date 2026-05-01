import {
    getMyReactionOnPost,
    reactToPostService,
    removeReactionFromPostService,
  } from "./reaction.service.js";
  
  const reactionResolver = {
    Query: {
      myReactionOnPost: (_parent, { postId }) => getMyReactionOnPost(postId),
    },
  
    Mutation: {
      reactToPost: (_parent, { input }) => reactToPostService(input),
      removeReactionFromPost: (_parent, { postId }) =>
        removeReactionFromPostService(postId),
    },
  
    Reaction: {
      id: (parent) => parent._id?.toString() ?? parent.id,
    },
  };
  
  export default reactionResolver;