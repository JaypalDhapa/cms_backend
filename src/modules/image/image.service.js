

import {
    findImage,
    findImages,
    softDeleteImage
} from './image.repository.js';

export async function getImage({ id }) {
    const image = await findImage({ id });
  
    if (!image) throw new Error("Image not found");
  
    return image;
  }

  export async function getImages(args) {
    return findImages(args);
  }

  export async function deleteImageService(id) {
    await softDeleteImage(id);
  
    return {
      success: true,
      message: "Image deleted successfully",
      id,
    };
  }