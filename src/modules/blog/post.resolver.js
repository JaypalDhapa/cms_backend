import {
  getPost,
  getPosts,
  getPinnedPosts,
  createPostService,
  updatePostService,
  deletePostService,
  publishPostService,
  unpublishPostService,
  pinPostService,
  unpinPostService,
} from "./post.service.js";
import { getCategory } from "../blogCategory/blogCategory.service.js";

const postResolver = {
  Query: {
    post: (_parent, { id, slug }) => getPost({ id, slug }),
    posts: (_parent, args) => getPosts(args),
    pinnedPosts: () => getPinnedPosts(),
  },

  Mutation: {
    createPost: (_parent, { input }) => createPostService(input),
    updatePost: (_parent, { id, input }) => updatePostService(id, input),
    deletePost: (_parent, { id }) => deletePostService(id),
    publishPost: (_parent, { id }) => publishPostService(id),
    unpublishPost: (_parent, { id }) => unpublishPostService(id),
    pinPost: (_parent, { id }) => pinPostService(id),
    unpinPost: (_parent, { id }) => unpinPostService(id),
  },

  Post: {
    id: (parent) => parent._id?.toString() ?? parent.id,
    // only fetches category when frontend explicitly requests it
    category: (parent) => {
      if (!parent.categoryId) return null
      return getCategory({ id: parent.categoryId.toString() })
    },
  },
};

export default postResolver;