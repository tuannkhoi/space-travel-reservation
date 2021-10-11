require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');

// pass the schema to ApolloServer
const server = new ApolloServer({ typeDefs });

server.listen().then(() => {
	console.log(`
		Server is running on port 4000
		https://studio.apollographql.com/sandbox
	`);
});