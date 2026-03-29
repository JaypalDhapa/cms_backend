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
  const { first, after, last, before } = args;

  if (last != null || before != null) {
    const limit = Math.min(last ?? 10, maxLimit);
    return {
      direction: "backward",
      limit,
      cursor: decodeCursor(before),
      rawCursor: before ?? null,
    };
  }

  const limit = Math.min(first ?? 10, maxLimit);
  return {
    direction: "forward",
    limit,
    cursor: decodeCursor(after),
    rawCursor: after ?? null,
  };
}

export function buildMongoosePaginationQuery({
  direction,
  cursor,
  sortField = "order",
  idField = "_id",
}) {
  const sort =
    direction === "forward"
      ? { [sortField]: 1, [idField]: 1 }
      : { [sortField]: -1, [idField]: -1 };

  if (!cursor) return { sort, filter: {} };

  const sortValue = cursor[sortField];
  const idValue = cursor[idField] ?? cursor.id;
  const gtOp = direction === "forward" ? "$gt" : "$lt";

  const filter = {
    $or: [
      { [sortField]: { [gtOp]: sortValue } },
      { [sortField]: sortValue, [idField]: { [gtOp]: idValue } },
    ],
  };

  return { sort, filter };
}

export function buildConnection({
  docs,
  limit,
  direction,
  totalCount,
  sortField = "order",
  idField = "_id",
  mapNode,
}) {
  const hasMore = docs.length > limit;
  let slice = hasMore ? docs.slice(0, limit) : docs;

  if (direction === "backward") slice = slice.reverse();

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
      hasNextPage: direction === "forward" ? hasMore : false,
      hasPreviousPage: direction === "backward" ? hasMore : false,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    },
    totalCount,
  };
}
