import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    courseId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Course",
    },
    lessonId:{
      type:mongoose.Schema.Types.ObjectId,
      reff:"Lesson",
    },
    imageAlt:String,
    imageUrl: {
      type: String,
      required: true,
    },
    isDeleted:{
      type:Boolean,
      default:false,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image",ImageSchema);
export default Image;