import {
  getPost,
  getPosts,
  getPinnedPosts,
  getRecentPosts,
  createPostService,
  updatePostService,
  deletePostService,
  publishPostService,
  unpublishPostService,
  pinPostService,
  unpinPostService,
} from "./post.service.js";

const postResolver = {
  Query: {
    post: (_parent, { id, slug }) => getPost({ id, slug }),
    posts: (_parent, args) => getPosts(args),
    // pinnedPosts: () => getPinnedPosts(),
    // recentPosts: (_parent, { limit }) => getRecentPosts(limit),
  },

  Mutation: {
    createPost: (_parent, { input }) => createPostService(input),
    updatePost: (_parent, { id, input }) => updatePostService(id, input),
    deletePost: (_parent, { id }) => deletePostService(id),
    // publishPost: (_parent, { id }) => publishPostService(id),
    // unpublishPost: (_parent, { id }) => unpublishPostService(id),
    // pinPost: (_parent, { id }) => pinPostService(id),
    // unpinPost: (_parent, { id }) => unpinPostService(id),
  },

  Post: {
    id: (parent) => parent._id?.toString() ?? parent.id,
  },
};

export default postResolver;
