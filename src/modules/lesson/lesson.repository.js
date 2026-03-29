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
  .populate("course","name")
  .lean();
}

export async function findLessons(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildLessonFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    direction: pagination.direction,
    cursor: pagination.cursor,
    sortField: "order",
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount] = await Promise.all([
    Lesson.find(finalFilter)
      .sort(sort)
      .limit(pagination.limit + 1)
      .populate("course","name")
      .lean(),
    Lesson.countDocuments(baseFilter),
  ]);

  return buildConnection({
    docs,
    limit: pagination.limit,
    direction: pagination.direction,
    totalCount,
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
