require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

// set up the SQLite DB
const store = createStore();

// pass the schema to ApolloServer
const server = new ApolloServer({ 
	typeDefs,
	resolvers,
	dataSources: () => ({
		launchAPI: new LaunchAPI(),
		userAPI: new UserAPI({ store })
	})
});

server.listen().then(() => {
	console.log(`
		Server is running on port 4000
		https://studio.apollographql.com/sandbox
	`);
});