import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";

const typesArray = loadFilesSync("src/modules/**/*.graphql");

export const typeDefs = mergeTypeDefs(typesArray);