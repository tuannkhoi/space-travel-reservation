const { RESTDataSource } = require('apollo-data-source');

class LaunchAPI extends RESTDataSource {
	constructor() {
		super();
		this.baseURL = 'https://api.spacexdata.com/v2/';
	}

	// methods that enable Launch API to fetch the data that incoming queries will request
	// according to schema, will need a method to get a list of all SpaceX launches
	async getAllLaunches() {
		const response = await this.get('launches');
		return Array.isArray(response) 
			? response.map(launch => this.launchReducer(launch)) //launchReducer transform the raw data -> match defined schema
			: [];
	}

	launchReducer(launch) {
		return {
			id: launch.flight_number || 0,
			cursor: `${launch.launch_date_unix}`,
			site: launch.launch_site && launch.launch_site.site_name,
			mission: {
				name: launch.mission_name,
				missionPatchSmall: launch.links.mission_patch_small,
				missionPatchLarge: launch.links.mission_patch,
			},
			rocket: {
				id: launch.rocket.rocket_id,
				name: launch.rocket.rocket_name,
				type: launch.rocket.rocket_type,
			},
			// field 'isBooked' will be populated by other data sources, which connects to a SQLite DB
		};
	}

	// according to schema, will need a method to fetch an individual launch by ID
	async getLaunchById({ launchId }) {
		const response = await this.get('launches', { flight_number: launchId });
		return this.launchReducer(response[0]);
	}
	// getLaunchesByIds() return the result of multiple calls to getLaunchById()
	getLaunchesByIds({ launchIds }) {
		return Promise.all(
			launchIds.map(launchId => this.getLaunchById({ launchId })),
		);
	}
}

module.exports = LaunchAPI;