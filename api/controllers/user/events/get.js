const moment = require('moment')
module.exports = {
	friendlyName: "Get",

	description: "Get events",

	inputs: {
		user: {
			type: "ref",
		},
		offset: {
			type: "number",
			defaultsTo: 0,
		},
		limit: {
			type: "number",
			defaultsTo: 1000,
		},
	},

	exits: {
		invalid: {
			responseType: "badRequest",
		},
		unauthorized: {
			responseType: "unauthorized",
		},
		forbidden: {
			responseType: "forbidden",
		},
		serverError: {
			responseType: "serverError",
		},
		ok: {
			responseType: "ok",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug(
			"Running user/events/get.js with inputs " + JSON.stringify(inputs)
		);
	
		try {
						
			let where = {}
			where.StartDate = {'>=':moment().toISOString()} 
			// where.StartTime = {'>=':moment().format("HH:mm")} 
			where.or = [{ state: 'published' }, {state:null}];
			events = await Event.find({where})
									.sort([
										// { CreatedDate: 'DESC' },	
										{ StartDate: 'ASC' },	
									]).skip(inputs.offset).limit(inputs.limit);

			return exits.ok({
				status: true,
				message: `${events.length} Events Listed Successfully`,
				data: events,
			});
		} catch (err) {
			sails.log.error("error calling user/events/get.js", err.message);
			if (
				!_.isUndefined(err.response) &&
				!_.isUndefined(err.response.data) &&
				!_.isUndefined(err.response.status)
			) {
				let [exitsName, responseData] = await sails.helpers.response.with({
					status: err.response.status,
					data: err.response.data,
				});
				return exits[exitsName](responseData);
			}
			return exits.serverError({
				status: false,
				data: [],
				message: "Unknown server error.",
			});
		}
	},
};
