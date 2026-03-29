import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";

const resolversArray = loadFilesSync("src/modules/**/*.resolver.js");

export const resolvers = mergeResolvers(resolversArray);