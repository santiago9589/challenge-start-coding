import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import {BookResolver} from "./resolvers/bookResolver"
import {AuthorResolver} from "./resolvers/authorResolver"
import {userResolver} from "./resolvers/userResolver"

export async function startServer() {
    const app = express();

    app.use(express.urlencoded({extended:false}))
    
    const apolloServer = new ApolloServer({
        schema : await buildSchema({ resolvers: [BookResolver,AuthorResolver,userResolver] }),
        context : ({req,res}) => ({req,res})
    });

    apolloServer.applyMiddleware({ app, path: '/graphql' })

    return app;
};