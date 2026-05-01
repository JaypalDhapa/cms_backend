import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // hardcoded for now, will be ObjectId ref User later
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
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

// One reaction per user per post
ReactionSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Reaction = mongoose.model("Reaction", ReactionSchema);
export default Reaction;