import mongoose from "mongoose";

const CommentReactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // hardcoded for now, will be ObjectId ref User later
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

// One reaction per user per comment
CommentReactionSchema.index({ userId: 1, commentId: 1 }, { unique: true });

const CommentReaction = mongoose.model("CommentReaction", CommentReactionSchema);
export default CommentReaction;