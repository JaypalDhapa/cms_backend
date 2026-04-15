import { Types } from "mongoose";

export const encodeCursor = (value) =>
  Buffer.from(`cursor:${value}`).toString("base64");

export const decodeCursor = (cursor) => {
  const decoded = Buffer.from(cursor, "base64").toString("utf8");
  if (!decoded.startsWith("cursor:")) throw new Error("Invalid cursor");
  return decoded.slice(7);
};

export const encodeCompositeCursor = (obj) =>
  Buffer.from(`cursor:${JSON.stringify(obj)}`).toString("base64");

export const decodeCompositeCursor = (cursor) => {
  const decoded = Buffer.from(cursor, "base64").toString("utf8");
  if (!decoded.startsWith("cursor:")) throw new Error("Invalid cursor");
  return JSON.parse(decoded.slice(7));
};

export const buildConnection = (docs, limit) => {
  const hasNextPage = docs.length > limit;
  const edges = docs.slice(0, limit);

  return {
    edges: edges.map((doc) => ({
      cursor: encodeCursor(doc._id.toString()),
      node: doc,
    })),
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
      startCursor: edges.length ? encodeCursor(edges[0]._id.toString()) : null,
      endCursor: edges.length
        ? encodeCursor(edges.at(-1)._id.toString())
        : null,
    },
  };
};
