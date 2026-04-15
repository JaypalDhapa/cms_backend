import Lesson from "./lesson.model.js";
import {
  parsePaginationArgs,
  buildMongoosePaginationQuery,
  buildConnection,
} from "../../utils/pagination.js";

function buildLessonFilter(filters = {}) {
  const filter = { isDeleted: filters.isDeleted ?? false };

  if (filters.courseId != null) filter.course = filters.courseId;
  if (filters.parentId != null) filter.parentId = filters.parentId;
  if (filters.type != null) filter.type = filters.type;
  if (filters.isPublished != null) filter.isPublished = filters.isPublished;

  return filter;
}

export async function findLesson({ id, slug }) {
  if (!id && !slug) throw new Error("Provide id or slug");
  return Lesson.findOne({
    ...(id ? { _id: id } : { slug }),
    isDeleted: false,
  })
    .populate("course", "name _id")
    .lean();
}

export async function findLessons(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildLessonFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    cursor: pagination.cursor,
    sortField: "order",
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount, published, draft] = await Promise.all([
    Lesson.find(finalFilter)
      .sort(sort)
      .limit(pagination.limit + 1)
      .populate("course", "name")
      .lean(),
    Lesson.countDocuments(baseFilter),
    Lesson.countDocuments({ ...baseFilter, isPublished: true }),
    Lesson.countDocuments({ ...baseFilter, isPublished: false }),
  ]);

  return buildConnection({
    docs,
    limit: pagination.limit,
    totalCount,
    published,
    draft,
    sortField: "order",
  });
}

export async function findSidebarLessons(courseId) {
  return Lesson.find({ course: courseId, isDeleted: false })
    .sort({ order: 1 })
    .lean();
}

export async function createLesson(data) {
  return new Lesson(data).save();
}

export async function updateLesson(id, data) {
  const updated = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate("course", "name _id")
    .lean();

  if (!updated) throw new Error("Lesson not found or has been deleted");
  return updated;
}

export async function softDeleteLesson(id) {
  const deleted = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();

  if (!deleted) throw new Error("Lesson not found or already deleted");
  return deleted;
}

export async function restoreLesson(id) {
  const restored = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .populate("course", "name _id")
    .lean();

  if (!restored) throw new Error("Lesson not found or not deleted");
  return restored;
}

export async function publishLesson(id) {
  const published = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isPublished: true, publishedAt: new Date() } },
    { new: true }
  )
    .populate("course", "name _id")
    .lean();

  if (!published) throw new Error("Lesson not found or has been deleted");
  return published;
}

export async function unpublishLesson(id) {
  const unpublished = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isPublished: false, publishedAt: null } },
    { new: true }
  )
    .populate("course", "name _id")
    .lean();

  if (!unpublished) throw new Error("Lesson not found or has been deleted");
  return unpublished;
}

export async function findRecentLessons(limit = 5) {
  return Lesson.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("course", "name")
    .lean();
}
