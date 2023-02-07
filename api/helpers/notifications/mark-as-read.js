module.exports = {
	friendlyName: "Mark notification as read",

	description: "",

	inputs: {
		id: {
			type: "number",
			required: true,
		},
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log("helper notifications/mark-as-read started");

		const id = inputs.id;		
		let updated = false;
		try {
			updated = await User_notification.updateOne({ id: id }).set({ is_read: true });
			updated = !_.isUndefined(updated)?true:false;
		} catch (err) {
			sails.log.error(`Error in helper notifications/mark-as-read. ${err}`);
    }
    sails.log("helper notifications/mark-as-read ended");
		return exits.success(updated);
	},
};
