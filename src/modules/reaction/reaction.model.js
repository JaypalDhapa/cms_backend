import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
    // userId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"User",
    //     required:true,
    // },
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
    },
    type:{
        type:String,
        enum:["like","dislike"],
        required:true,
    }
},
{timestamps:true});


ReactionSchema.index(
    // {userId:1,PostId:1},
    {postId:1},
    {unique:true}
)
const Reaction = mongoose.model("Reaction",ReactionSchema);

export default Reaction;