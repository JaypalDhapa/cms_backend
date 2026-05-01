import Reaction from "./reaction.model.js";
import { incrementPostEngagement } from "../blog/post.repository.js";

export async function findUserReactionOnPost(userId, postId) {
  return Reaction.findOne({ userId, postId }).lean();
}

export async function togglePostReaction(userId, postId, type) {
  const existing = await findUserReactionOnPost(userId, postId);

  // Case 1 — No reaction yet: create it, increment counter
  if (!existing) {
    const reaction = await Reaction.create({ userId, postId, type });
    const engagement = await incrementPostEngagement(
      postId,
      type === "like" ? "likeCount" : "dislikeCount",
      1
    );
    return {
      reaction,
      action: "added",
      engagement: engagement.engagement,
    };
  }

  // Case 2 — Same type clicked again: remove it (toggle off)
  if (existing.type === type) {
    await Reaction.deleteOne({ _id: existing._id });
    const engagement = await incrementPostEngagement(
      postId,
      type === "like" ? "likeCount" : "dislikeCount",
      -1
    );
    return {
      reaction: null,
      action: "removed",
      engagement: engagement.engagement,
    };
  }

  // Case 3 — Opposite type: switch it (like → dislike or dislike → like)
  await Reaction.updateOne({ _id: existing._id }, { $set: { type } });
  const updatedReaction = await Reaction.findById(existing._id).lean();

  // Increment new type, decrement old type
  const oldField = existing.type === "like" ? "likeCount" : "dislikeCount";
  const newField = type === "like" ? "likeCount" : "dislikeCount";

  await incrementPostEngagement(postId, oldField, -1);
  const engagement = await incrementPostEngagement(postId, newField, 1);

  return {
    reaction: updatedReaction,
    action: "switched",
    engagement: engagement.engagement,
  };
}

export async function removePostReaction(userId, postId) {
  const existing = await findUserReactionOnPost(userId, postId);
  if (!existing) throw new Error("No reaction found");

  await Reaction.deleteOne({ _id: existing._id });
  const engagement = await incrementPostEngagement(
    postId,
    existing.type === "like" ? "likeCount" : "dislikeCount",
    -1
  );

  return { engagement: engagement.engagement };
}