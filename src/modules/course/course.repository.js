import Course from './course.model.js';
import {
  parsePaginationArgs,
  buildMongoosePaginationQuery,
  buildConnection,
} from '../../utils/pagination.js';

function buildCourseFilter(filters = {}) {
  const filter = { isDeleted: filters.isDeleted ?? false };
  if (filters.isPublished != null) filter.isPublished = filters.isPublished;
  return filter;
}

// ── GET ONE ──────────────────────────────────────────────────────────────────

export async function findCourse({ id, slug }) {
  if (!id && !slug) throw new Error('Provide id or slug');
  return Course.findOne({
    ...(id ? { _id: id } : { slug }),
    isDeleted: false,
  }).lean();
}

// ── GET MANY (cursor-paginated) ───────────────────────────────────────────────

export async function findCourses(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildCourseFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    cursor: pagination.cursor,
    sortField: 'order',
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount] = await Promise.all([
    Course.find(finalFilter).sort(sort).limit(pagination.limit + 1).lean(),
    Course.countDocuments(baseFilter),
  ]);

  return buildConnection({ docs, limit: pagination.limit, totalCount, sortField: 'order' });
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createCourse(data) {
  return new Course(data).save();
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateCourse(id, data) {
  const updated = await Course.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  return updated;
}

// ── SOFT DELETE ───────────────────────────────────────────────────────────────

export async function softDeleteCourse(id) {
  const result = await Course.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return !!result; // true = deleted, false = not found
}


export async function restoreCourse(id) {
  const restored = await Course.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  ).lean();
 
  if (!restored) throw new Error('Course not found or not deleted');
  return restored;
}