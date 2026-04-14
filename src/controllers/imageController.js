import Image from "../models/Image.js";;
import uploadToCloudinary from "../services/cloudinaryService.js";

export async function uploadImage(req,res){
    try{
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"No file uploaded",
            })
        }

        const result = await uploadToCloudinary(req.file.buffer);

        const savedImage = await Image.create({
            imageUrl:result.secure_url,
            publicId:result.public_id,
        });

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