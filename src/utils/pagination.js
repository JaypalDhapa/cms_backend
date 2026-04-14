export function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export function parsePaginationArgs(args = {}, maxLimit = 100) {
  const { first, after } = args; //first = limit and after = where to start
  const limit = Math.min(first ?? 10, maxLimit);
  return {
    limit,
    cursor: decodeCursor(after),
    rawCursor: after ?? null,
  };
}

export function buildMongoosePaginationQuery({
  cursor,
  sortField = "order",
  idField = "_id",
}) {
  const sort = { [sortField]: 1, [idField]: 1 };

  if (!cursor) return { sort, filter: {} };

  const sortValue = cursor[sortField];
  const idValue = cursor[idField] ?? cursor.id;

  const filter = {
    $or: [
      { [sortField]: { $gt: sortValue } },
      { [sortField]: sortValue, [idField]: { $gt: idValue } },
    ],
  };

  return { sort, filter };
}

export function buildConnection({
  docs,
  limit,
  totalCount,
  published,
  draft,
  sortField = "order",
  idField = "_id",
  mapNode,
}) {
  const hasMore = docs.length > limit;
  const slice = hasMore ? docs.slice(0, limit) : docs;

  const defaultMap = (doc) => {
    const obj =
      typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
    obj.id = obj._id?.toString();
    return obj;
  };

  const toNode = mapNode ?? defaultMap;

  const edges = slice.map((doc) => ({
    cursor: encodeCursor({
      [sortField]: doc[sortField],
      [idField]: doc[idField]?.toString() ?? doc.id,
    }),
    node: toNode(doc),
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage: hasMore,
      hasPreviousPage: false,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    },
    totalCount,
    published,
    draft,
  };
}
