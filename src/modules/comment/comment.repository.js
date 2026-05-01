import { Types } from "mongoose";
import Comment from "./comment.model.js";
import { incrementPostEngagement } from "../blog/post.repository.js";
import {
  decodeCursor,
  encodeCursor,
} from "../../utils/blogPagination.js";

const MAX_DEPTH = 3;

export async function findComments(args = {}) {
  const { filter = {}, pagination = {} } = args;
  const limit = Math.min(pagination.first || 10, 50);

  const query = { isDeleted: false };

  if (filter.postId) query.postId = new Types.ObjectId(filter.postId);

  // If rootId provided — fetch entire thread flat
  if (filter.rootId) {
    query.rootId = new Types.ObjectId(filter.rootId);
  } else if (filter.parentId) {
    // Direct replies to a specific comment
    query.parentId = new Types.ObjectId(filter.parentId);
  } else {
    // Top-level comments only
    query.parentId = null;
  }

  if (pagination.after) {
    const id = decodeCursor(pagination.after);
    query._id = { $gt: new Types.ObjectId(id) };
  }

  const [docs, totalCount] = await Promise.all([
    Comment.find(query).sort({ _id: 1 }).limit(limit + 1).lean(),
    Comment.countDocuments({ ...query, _id: undefined }),
  ]);

  const hasNextPage = docs.length > limit;
  const edges = docs.slice(0, limit);

  return {
    edges: edges.map((doc) => ({
      cursor: encodeCursor(doc._id.toString()),
      node: doc,
    })),
    totalCount: Number(totalCount) || 0,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
      startCursor: edges.length ? encodeCursor(edges[0]._id.toString()) : null,
      endCursor: edges.length
        ? encodeCursor(edges.at(-1)._id.toString())
        : null,
    },
  };
}

export async function createComment({ postId, content, parentId, userId }) {
  let rootId = null;
  let depth = 0;

  if (parentId) {
    const parent = await Comment.findOne({
      _id: parentId,
      isDeleted: false,
    }).lean();

    if (!parent) throw new Error("Parent comment not found");
    if (parent.depth >= MAX_DEPTH)
      throw new Error(`Max reply depth of ${MAX_DEPTH} reached`);

    // rootId is always the top-level comment
    rootId = parent.rootId ?? parent._id;
    depth = parent.depth + 1;

    // Increment replyCount on direct parent
    await Comment.findByIdAndUpdate(parentId, {
      $inc: { "engagement.replyCount": 1 },
    });
  }

  // Increment commentCount on the post (only for top-level comments)
  if (!parentId) {
    await incrementPostEngagement(postId, "commentCount", 1);
  }

  const comment = await Comment.create({
    postId,
    content,
    parentId: parentId ?? null,
    rootId,
    depth,
    userId,
  });

  return comment.toObject();
}

export async function updateComment(id, { content }) {
  const updated = await Comment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { content } },
    { new: true }
  ).lean();

  if (!updated) throw new Error("Comment not found");
  return updated;
}

export async function softDeleteComment(id) {
  const comment = await Comment.findOne({ _id: id, isDeleted: false }).lean();
  if (!comment) throw new Error("Comment not found");

  await Comment.findByIdAndUpdate(id, { $set: { isDeleted: true } });

  // Decrement replyCount on parent if it was a reply
  if (comment.parentId) {
    await Comment.findByIdAndUpdate(comment.parentId, {
      $inc: { "engagement.replyCount": -1 },
    });
  }

  // Decrement commentCount on post if top-level
  if (!comment.parentId) {
    await incrementPostEngagement(comment.postId, "commentCount", -1);
  }

  return true;
}

export async function incrementCommentEngagement(id, field, amount = 1) {
  return Comment.findByIdAndUpdate(
    id,
    { $inc: { [`engagement.${field}`]: amount } },
    { new: true }
  ).lean();
}