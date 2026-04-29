// src/modules/lesson/lesson.repository.js
// CHANGED:
//   1. buildLessonFilter — added sectionId filter
//      sectionId: null explicitly → filter section: null (root level lessons)
//      sectionId: "<id>" → filter section: id (section lessons)
//   2. All reads now populate section alongside course
//   3. findSidebarLessons — updated to return sections with their lessons nested

import Lesson from './lesson.model.js';
import Section from '../section/section.model.js';
import {
  parsePaginationArgs,
  buildMongoosePaginationQuery,
  buildConnection,
} from '../../utils/pagination.js';

function buildLessonFilter(filters = {}) {
  const filter = { isDeleted: filters.isDeleted ?? false };

  if (filters.courseId != null) filter.course = filters.courseId;
  if (filters.type != null) filter.type = filters.type;
  if (filters.isPublished != null) filter.isPublished = filters.isPublished;

  // sectionId handling:
  //   explicitly null → root level lessons (section field is null in DB)
  //   a string id     → lessons inside that specific section
  //   undefined       → no filter (all lessons regardless of section)
  if ('sectionId' in filters) {
    filter.section = filters.sectionId === null ? null : filters.sectionId;
  }

  return filter;
}

const LESSON_POPULATE = [
  {
    path: 'course',
    select: 'name _id',
    populate: {
      path: 'category',
      select: 'name _id',
    },
  },
  {
    path: 'section',
    select: 'name _id',
  },
];

// ── GET ONE ───────────────────────────────────────────────────────────────────

export async function findLesson({ id, slug }) {
  if (!id && !slug) throw new Error('Provide id or slug');
  return Lesson.findOne({
    ...(id ? { _id: id } : { slug }),
    isDeleted: false,
  })
    .populate(LESSON_POPULATE)
    .lean();
}

// ── GET MANY (cursor-paginated) ───────────────────────────────────────────────

export async function findLessons(args = {}) {
  const { filters = {}, ...paginationRawArgs } = args;

  const pagination = parsePaginationArgs(paginationRawArgs);
  const baseFilter = buildLessonFilter(filters);
  const { sort, filter: cursorFilter } = buildMongoosePaginationQuery({
    cursor: pagination.cursor,
    sortField: 'order',
  });

  const finalFilter = {
    ...baseFilter,
    ...(Object.keys(cursorFilter).length ? cursorFilter : {}),
  };

  const [docs, totalCount, published, draft] = await Promise.all([
    Lesson.find(finalFilter)
      .sort(sort)
      .limit(pagination.limit + 1)
      .populate(LESSON_POPULATE)
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
    sortField: 'order',
  });
}

// ── SIDEBAR (course sidebar tree) ─────────────────────────────────────────────
// Returns { sections: [...with their lessons], rootLessons: [...] }
// Frontend can render the full sidebar from this single response

export async function findSidebarLessons(courseId) {
  const [sections, allLessons] = await Promise.all([
    Section.find({ course: courseId, isDeleted: false })
      .sort({ order: 1 })
      .lean(),
    Lesson.find({ course: courseId, isDeleted: false, isPublished: true })
      .sort({ order: 1 })
      .lean(),
  ]);

  // Group lessons by section
  const lessonsBySection = {};
  const rootLessons = [];

  for (const lesson of allLessons) {
    const sectionKey = lesson.section?.toString() ?? null;
    if (sectionKey) {
      if (!lessonsBySection[sectionKey]) lessonsBySection[sectionKey] = [];
      lessonsBySection[sectionKey].push(lesson);
    } else {
      rootLessons.push(lesson);
    }
  }

  const sectionsWithLessons = sections.map((s) => ({
    ...s,
    id: s._id.toString(),
    lessons: lessonsBySection[s._id.toString()] ?? [],
  }));

  return { sections: sectionsWithLessons, rootLessons };
}

// ── RECENT ────────────────────────────────────────────────────────────────────

export async function findRecentLessons(limit = 5) {
  return Lesson.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate(LESSON_POPULATE)
    .lean();
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createLesson(data) {
  // Map section input: undefined/missing stays null (root level)
  const payload = {
    ...data,
    section: data.section ?? null,
  };
  const doc = await new Lesson(payload).save();
  return Lesson.findById(doc._id).populate(LESSON_POPULATE).lean();
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateLesson(id, data) {
  const payload = { ...data };
  // Allow explicitly moving lesson to root level by passing section: null
  if ('section' in payload && payload.section === undefined) {
    payload.section = null;
  }

  const updated = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: payload },
    { new: true, runValidators: true }
  )
    .populate(LESSON_POPULATE)
    .lean();

  if (!updated) throw new Error('Lesson not found or has been deleted');
  return updated;
}

// ── SOFT DELETE ───────────────────────────────────────────────────────────────

export async function softDeleteLesson(id) {
  const deleted = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();
  if (!deleted) throw new Error('Lesson not found or already deleted');
  return deleted;
}

// ── RESTORE ───────────────────────────────────────────────────────────────────

export async function restoreLesson(id) {
  const restored = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .populate(LESSON_POPULATE)
    .lean();
  if (!restored) throw new Error('Lesson not found or not deleted');
  return restored;
}

// ── PUBLISH / UNPUBLISH ───────────────────────────────────────────────────────

export async function publishLesson(id) {
  const published = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isPublished: true, publishedAt: new Date() } },
    { new: true }
  )
    .populate(LESSON_POPULATE)
    .lean();
  if (!published) throw new Error('Lesson not found or has been deleted');
  return published;
}

export async function unpublishLesson(id) {
  const unpublished = await Lesson.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isPublished: false, publishedAt: null } },
    { new: true }
  )
    .populate(LESSON_POPULATE)
    .lean();
  if (!unpublished) throw new Error('Lesson not found or has been deleted');
  return unpublished;
}
