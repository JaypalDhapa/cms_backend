import mongoose from "mongoose";

const CommentReactionSchema = new mongoose.Schema(
    {
     
    //   userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true
    //   },
  
      commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
      },
  
      type: {
        type: String,
        enum: ["like", "dislike"],
        required: true
      }
    },
    {
      timestamps: true
    }
  );

  CommentReactionSchema.index(
    { userId: 1, commentId: 1 },
    { unique: true }
  );

  const CommentReaction = mongoose.model("CommentReaction",CommentReactionSchema);

  export default CommentReaction;