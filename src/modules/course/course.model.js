import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },

    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    order:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:false,
        index:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
        index:true,
    }
},
{timestamps:true}
);

courseSchema.index({isPublished:1,order:1});
const Course = mongoose.model("Course",courseSchema);
export default Course;
