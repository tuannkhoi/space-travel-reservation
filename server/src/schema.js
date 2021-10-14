const { gql } = require('apollo-server');

const typeDefs = gql`
	type Query { #allow clients to fetch data
		# launches: [Launch]! #return an array of upcoming launches
		launches (
			# The number of results to show. Must be >= 1. Default = 20.
			pageSize: Int
			# If you add a cursor here, it will only return results _after_ this cursor
			after: String
		): LaunchConnection!
		launch(id: ID!): Launch #return a single Launch that matches the id
		me: User #return details of the currently logged in User
	}
	# Simple wrapper around our list of launches that contains a cursor to the
	# last item in the list. Pass this cursor to the launches query to fetch results after these
	type LaunchConnection {
		cursor: String!
		hasMore: Boolean!
		launches: [Launch]!
	}
	type Mutation { # allow clients to modify data
		bookTrips(launchIds: [ID]!): TripUpdateResponse!
		cancelTrip(launchIds: ID!): TripUpdateResponse!
		login(email: String): User

	}
	type TripUpdateResponse {
		success: Boolean!
		message: String
		launches: [Launch] #good practice for a mutation to return whatever objects it modifies so the requesting client can update its cache and UI without needing to make a follow up query
	}
	# Each object type define should represent an object that an application client might need to interact with
	# App will need to fetch a list of upcoming rocket launches -> define a Launch type to support that behaviour
	type Launch {
		id: ID!
		site: String
		mission: Mission # Mission and Rocket refer to other object types
		rocket: Rocket # have to define them below
		isBooked: Boolean!
	}
	type Rocket {
		id: ID!
		name: String
		type: String
	}
	type User {
		id: ID!
		email: String!
		trips: [Launch]! #array! -> cannot be null, but can be empty
		token: String
	}
	type Mission {
		name: String
		missionPatch(size: PatchSize): String
	}
	enum PatchSize {
		SMALL
		LARGE
	}
`;

module.exports = typeDefs;