import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
content: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
    index: true
  },
  rootId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
    index: true
  },
  depth: {
    type: Number,
    default: 0
  },
  engagement:{
    likeCount: {
        type: Number,
        default: 0
      },
  
      dislikeCount: {
        type: Number,
        default: 0
      },
  
      replyCount: {
        type: Number,
        default: 0
      },
  },
  isDeleted: {
    type: Boolean,
    default: false
  }

},{
    timestamps:true,
});

// Fetch root comments fast
CommentSchema.index({ postId: 1, parentId: 1 });

// Fetch full thread fast
CommentSchema.index({ rootId: 1 });

// Sorting
CommentSchema.index({ createdAt: -1 });

const Comment = mongoose.model("Comment",CommentSchema);

export default Comment;
