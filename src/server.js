import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import connectDB from "./config/connectDB.js";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolver.js";

//connectDB
connectDB();

// const typeDefs = `
//     type Query {
//         greet:String
//     }

// `;

// const resolvers = {
//     Query:{
//         greet: () => "good evening"
//     }
// }

const Server = new ApolloServer({
    typeDefs,
    resolvers
})

const {url} = await startStandaloneServer(Server,{
    listen:{port:4000}
})

console.log(url)