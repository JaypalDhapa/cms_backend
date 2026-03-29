import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
     fullSlug:{
        type:String,
        trim:true,
        lowercase:true
    },
    description:{
        type:String,
        trim:true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Course",
    },
    type: {
        type: String,
        enum: ["single", "group"],
        default: "single"
    },
    parentId:{
        type:mongoose.Schema.Types.ObjectId , //for grouping logic in sidebar like dropdwon menu
        default:null,
        ref:"Lesson",
    },
    order:{
        type:Number,
        default:0,
        min:0
    },
    content:{
        type:String,
        required:true,
    },
    isPublished:{
        type:Boolean,
        default:false,
        index:true,
    },
    publishedAt:{
        type:Date,
        default:null
    },
    isDeleted:{
        type:Boolean,
        default:false,
        index:true,
    },
    meta:{
        title:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:true
        },
        keywords:[String]
    }


},{timestamps:true});

lessonSchema.index({course:1,order:1});

// Unique slug per course
lessonSchema.index({course:1,slug:1}, {unique:true});

//published lessons filter
lessonSchema.index({course:1,isPublished:1,order:1});

lessonSchema.index(
    {fullSlug:1},
    {unique:true,sparse:true}
);

//for sidebar / nested group odering
lessonSchema.index({parentId:1, order:1});

// Auto-set publishedAt
// lessonSchema.pre("save", function (next) {
//     if (this.isPublished && !this.publishedAt) {
//       this.publishedAt = new Date();
//     }
//     next();
//   });

lessonSchema.pre("save", async function () {
    if (this.isPublished && !this.publishedAt) {
      this.publishedAt = new Date();
    }
});
  
const Lesson = mongoose.model("Lesson",lessonSchema);

export default Lesson;