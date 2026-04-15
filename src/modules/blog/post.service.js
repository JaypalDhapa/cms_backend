import {
  findPost,
  findPosts,
  findPinnedPosts,
  findRecentPosts,
  createPost,
  updatePost,
  softDeletePost,
  publishPost,
  unpublishPost,
  pinPost,
  unpinPost,
} from "./post.repository.js";

import { revalidateNextJs } from "../../utils/revalidate.js";

export async function getPost({ id, slug }) {
  const post = await findPost({ id, slug });

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
}

export async function getPosts(args) {
  return findPosts(args);
}

export async function getPinnedPosts() {
  return findPinnedPosts();
}

export async function getRecentPosts(limit = 5) {
  return findRecentPosts(limit);
}

export async function createPostService(input) {
  const post = await createPost(input);

  // optional Next.js revalidation
  // await revalidateNextJs({
  //   type: "post",
  //   slug: post.slug,
  // });

  return post;
}

export async function updatePostService(id, input) {
  const extra = {};

  // auto-set publish date when published from update
  if (input.isPublished === true) {
    extra.publishedAt = new Date();
  }

  const post = await updatePost(id, {
    ...input,
    ...extra,
  });

  // optional revalidation
  // await revalidateNextJs({
  //   type: "post",
  //   slug: post.slug,
  // });

  return post;
}

export async function deletePostService(id) {
  await softDeletePost(id);

  return {
    success: true,
    message: "Post deleted successfully",
    id,
  };
}

export async function publishPostService(id) {
  const post = await publishPost(id);

  // most important revalidation
  // await revalidateNextJs({
  //   type: "post",
  //   slug: post.slug,
  // });

  return post;
}

export async function unpublishPostService(id) {
  return unpublishPost(id);
}

export async function pinPostService(id) {
  return pinPost(id);
}

export async function unpinPostService(id) {
  return unpinPost(id);
}
