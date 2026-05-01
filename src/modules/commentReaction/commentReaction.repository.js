import CommentReaction from "./commentReaction.mode.js";
import { incrementCommentEngagement } from "../comment/comment.repository.js";

export async function findUserReactionOnComment(userId, commentId) {
  return CommentReaction.findOne({ userId, commentId }).lean();
}

export async function toggleCommentReaction(userId, commentId, type) {
  const existing = await findUserReactionOnComment(userId, commentId);

  // Case 1 — No reaction yet: create it, increment counter
  if (!existing) {
    const reaction = await CommentReaction.create({ userId, commentId, type });
    const updated = await incrementCommentEngagement(
      commentId,
      type === "like" ? "likeCount" : "dislikeCount",
      1
    );
    return {
      reaction,
      action: "added",
      engagement: updated.engagement,
    };
  }

  // Case 2 — Same type clicked again: remove it (toggle off)
  if (existing.type === type) {
    await CommentReaction.deleteOne({ _id: existing._id });
    const updated = await incrementCommentEngagement(
      commentId,
      type === "like" ? "likeCount" : "dislikeCount",
      -1
    );
    return {
      reaction: null,
      action: "removed",
      engagement: updated.engagement,
    };
  }

  // Case 3 — Opposite type: switch it
  await CommentReaction.updateOne({ _id: existing._id }, { $set: { type } });
  const updatedReaction = await CommentReaction.findById(existing._id).lean();

  const oldField = existing.type === "like" ? "likeCount" : "dislikeCount";
  const newField = type === "like" ? "likeCount" : "dislikeCount";

  await incrementCommentEngagement(commentId, oldField, -1);
  const updated = await incrementCommentEngagement(commentId, newField, 1);

  return {
    reaction: updatedReaction,
    action: "switched",
    engagement: updated.engagement,
  };
}

export async function removeCommentReaction(userId, commentId) {
  const existing = await findUserReactionOnComment(userId, commentId);
  if (!existing) throw new Error("No reaction found");

  await CommentReaction.deleteOne({ _id: existing._id });
  const updated = await incrementCommentEngagement(
    commentId,
    existing.type === "like" ? "likeCount" : "dislikeCount",
    -1
  );

  return { engagement: updated.engagement };
}