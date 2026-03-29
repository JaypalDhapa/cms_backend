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
        requried:true,
        unique:true,
    },
    order:{
        type:Number,
        default:0,
    }
},
{timestamps:true}
);

const Course = mongoose.model("Category",courseSchema);
export default Course;
