import Image from "../models/Image.js";;
import uploadToCloudinary from "../services/cloudinaryService.js";

export async function uploadImage(req,res){
    try{
        const {courseId,lessonId,imageAlt} = req.body;
        const file = req.file;
        if(!file){
            return res.status(400).json({
                success:false,
                message:"No file uploaded",
            })
        }

        console.time('cloudinary_upload')
        const result = await uploadToCloudinary(req.file.buffer);
        console.timeEnd('cloudinary_upload')

        console.time('mongo_save')
        const savedImage = await Image.create({
            courseId,
            lessonId,
            imageAlt,
            imageUrl:result.secure_url,
            publicId:result.public_id,
        });
        console.timeEnd('mongo_save')

        return res.status(201).json({
            success:true,
            message:"Image uploaded successfully",
            imagedata:{
                id:savedImage._id,
                secure_url:savedImage.imageUrl,
            },
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}