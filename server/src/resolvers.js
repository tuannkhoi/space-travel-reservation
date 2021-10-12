const { paginateResults } = require('./utils');

module.exports = {
	Query: {
		// fieldName: (parents, args, context, info) => data;
		// launches: (_, __, { dataSources }) => dataSources.launchAPI.getAllLaunches(),
		launches: async (_, { pageSize = 20, after }, { dataSources }) => {
			const allLaunches = await dataSources.launchAPI.getAllLaunches();
			// we want these in reverse chronological order
			allLaunches.reverse();
			const launches = paginateResults({
				after,
				pageSize,
				results: allLaunches,
			});
			return {
				launches,
				cursor: launches.length ? launches[launches.length - 1].cursor : null,
				// if the cursor at the end of the paginated results = last
				// item in _all_ results -> there are no more results after this
				hasMore: launches.length
					? launches[launches.length - 1].cursor !== allLaunches[allLaunches.length - 1].cursor
					: false,
			};
		},
		launch: (_, { id }, { dataSources }) => dataSources.launchAPI.getLaunchById({ launchId: id }),
		me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
	},

	Mission: {
		// The default size is LARGE if not provided
		missionPatch: (mission, { size } = { size: 'LARGE' }) => {
			return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge;
		},
	},

	Launch: {
		isBooked: async (launch, _, { dataSources }) => dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
	},

	User: {
		trips: async (_, __, { dataSources }) => {
			// get ids of launches by user
			const launchIds = await dataSources.userAPI.getLaunchByIdByUser();
			if (!launchIds.length) return [];
			// look up those launches by their ids
			return (
				dataSources.launchAPI.getLaunchesByIds({
					launchIds,
				}) || []
			);
		}
	},
};