import mongoose from "mongoose";
import { tutorialDB } from '../config/connectDB.js';

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

const Image = tutorialDB.model("Image", ImageSchema);
export default Image;