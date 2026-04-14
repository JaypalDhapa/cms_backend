// import "dotenv/config";
import express from 'express';
import cors from 'cors';

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { startStandaloneServer } from "@apollo/server/standalone";
import connectDB from "./config/connectDB.js";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolver.js";

import imageRoutes from './routes/imageRoutes.js';

//connectDB
connectDB();


const Server = new ApolloServer({
    typeDefs,
    resolvers
})

await Server.start();

// const {url} = await startStandaloneServer(Server,{
//     listen:{port:4000}
// })

const app = express();

app.use("/graphql",
    cors(),
    express.json(),
    expressMiddleware(Server)
)
app.use(cors());
//Routes
app.use('/api/image',imageRoutes);

app.get("/",(req,res)=>{
    res.send("Hello from express");
})


export default app;