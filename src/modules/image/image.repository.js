import Image from "../../models/Image.js";

import { decodeCursor, buildConnection} from '../../utils/blogPagination.js'

function buildImageFilter(filters = {} ){
    const filter = {
        isDeleted:false,
    };

    //course filter
    if(filters.courseId){
        filter.courseId = filters.courseId;
    }

    //lesson filter
    if(filters.lessonId){
        filter.lessonId = filters.lessonId;
    }

      // search in alt text
  if (filters.search) {
    filter.imageAlt = {
      $regex: filters.search,
      $options: "i",
    };
  }

    return filter;
}

//find single image

export async function findImage({ id }) {
    if (!id) throw new Error("Provide id");
  
    return Image.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
  }

//   find images 

export async function findImages(args = {}) {
    const { filter: filters = {}, pagination = {} } = args;
  
    const limit = Math.min(pagination.first || 10, 50);
  
    const baseFilter = buildImageFilter(filters);
    const finalFilter = { ...baseFilter };
  
    //  cursor pagination
    if (pagination.after) {
      const id = decodeCursor(pagination.after);
      finalFilter._id = { $gt: new Types.ObjectId(id) };
    }
  
    const [docs, totalCount] = await Promise.all([
      Image.find(finalFilter)
        .sort({ _id: 1 })
        .limit(limit + 1)
        .lean(),
  
      Image.countDocuments(baseFilter),
    ]);
  
    return buildConnection(docs, limit, totalCount);
  }

//   soft delete

export async function softDeleteImage(id) {
    const deleted = await Image.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();
  
    if (!deleted) {
      throw new Error("Image not found or already deleted");
    }
  
    return true;
  }