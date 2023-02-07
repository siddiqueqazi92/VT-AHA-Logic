module.exports = {
	friendlyName: "Get",

	description: "Get notifications",

	inputs: {
		user_id: {
			type: "string",
			required: true,
		},
	},

	exits: {},

	fn: async function (inputs, exits) {
		sails.log("helper notifications/unread-count started");
		let data = 0;
		try {
			data = await User_notification.count({
				user_id: inputs.user_id,
				is_read: false,
			});

			sails.log("helper notifications/unread-count ended");
		} catch (err) {
			sails.log.error(`Error in helper notifications/unread-count. ${err}`);
		}
		return exits.success(data);
	},
};
