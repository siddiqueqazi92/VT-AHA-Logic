const moment = require('moment')
module.exports = {
	friendlyName: "Get event",

	description: "Get one event",

	inputs: {
		user: {
			type: "ref",
		},
		id: {
			type: "string",
			required:true
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
			"Running user/events/get-one.js with inputs " + JSON.stringify(inputs)
		);
	
		try {
			let where = {_id:inputs.id}						
			let event = await Event.findOne({ where });			
			if (!event) {
				where = { id: parseInt(inputs.id) }
				event =await Event.findOne({ where });			
			}
			return exits.ok({
				status: true,
				message: `Event Found Successfully`,
				data: event,
			});
		} catch (err) {
			sails.log.error("error calling user/events/get-one.js", err.message);
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
