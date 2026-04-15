import {
    getImage,
    getImages,
    deleteImageService,
} from './image.service.js';

const imageResolver = {
    Query: {
      image: (_parent, { id }) => getImage({ id }),
  
      images: (_parent, args) => getImages(args),
    },
    Mutation: {
    
        deleteImage: (_parent, { id }) =>
          deleteImageService(id),
      },
      Image: {
        id: (parent) => parent._id?.toString() ?? parent.id,
      }
}

export default imageResolver