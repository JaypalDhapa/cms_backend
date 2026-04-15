import Post from "./post.model.js";

import { decodeCursor, buildConnection } from "../../utils/blogPagination.js";

function buildPostFilter(filters = {}) {
  const filter = {
    isDeleted: false,
  };

  if (filters.isPublished != null) {
    filter.isPublished = filters.isPublished;
  }

  if (filters.isPinned != null) {
    filter.isPinned = filters.isPinned;
  }

  if (filters.tags?.length) {
    filter.tags = { $in: filters.tags };
  }

  if (filters.search) {
    filter.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { content: { $regex: filters.search, $options: "i" } },
      { excerpt: { $regex: filters.search, $options: "i" } },
    ];
  }

  return filter;
}

export async function findPost({ id, slug }) {
  if (!id && !slug) {
    throw new Error("Provide id or slug");
  }

  return Post.findOne({
    ...(id ? { _id: id } : { slug }),
    isDeleted: false,
  }).lean();
}

export async function findPosts(args = {}) {
  const { filter: filters = {}, pagination = {} } = args;

  const limit = Math.min(pagination.first || 10, 50);

  const baseFilter = buildPostFilter(filters);
  const finalFilter = { ...baseFilter };

  if (pagination.after) {
    const id = decodeCursor(pagination.after);
    finalFilter._id = { $gt: new Types.ObjectId(id) };
  }

  const [docs, totalCount] = await Promise.all([
    Post.find(finalFilter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .lean(),

    Post.countDocuments(baseFilter),
  ]);

  return buildConnection(docs, limit, totalCount);
}

export async function createPost(data) {
  return new Post(data).save();
}

export async function updatePost(id, data) {
  const updated = await Post.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new Error("Post not found or deleted");
  }

  return updated;
}

export async function softDeletePost(id) {
  const deleted = await Post.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();

  if (!deleted) {
    throw new Error("Post not found or already deleted");
  }

  return true;
}

export async function publishPost(id) {
  const published = await Post.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $set: {
        isPublished: true,
        publishedAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!published) {
    throw new Error("Post not found");
  }

  return published;
}

export async function unpublishPost(id) {
  const unpublished = await Post.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $set: {
        isPublished: false,
        publishedAt: null,
      },
    },
    { new: true }
  ).lean();

  if (!unpublished) {
    throw new Error("Post not found");
  }

  return unpublished;
}

export async function pinPost(id) {
  const pinned = await Post.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isPinned: true } },
    { new: true }
  ).lean();

  if (!pinned) {
    throw new Error("Post not found");
  }

  return pinned;
}

export async function unpinPost(id) {
  const unpinned = await Post.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isPinned: false } },
    { new: true }
  ).lean();

  if (!unpinned) {
    throw new Error("Post not found");
  }

  return unpinned;
}

export async function findPinnedPosts() {
  return Post.find({
    isPinned: true,
    isDeleted: false,
    isPublished: true,
  })
    .sort({ _id: -1 })
    .lean();
}

export async function findRecentPosts(limit = 5) {
  return Post.find({
    isDeleted: false,
    isPublished: true,
  })
    .sort({ _id: -1 })
    .limit(limit)
    .lean();
}
