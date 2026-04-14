import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream(
            {
                folder:"cms_image",
                resource_type:'auto',
            },
            (error,result) =>{
                if(error) reject(error);
                else resolve(result)
            }
        )
        .end(fileBuffer);
    });
};

export default uploadToCloudinary;