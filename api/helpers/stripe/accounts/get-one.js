module.exports = {
	friendlyName: "Create account",

	description: "",

	inputs: {
		account_id: {
			type: "string",
			required: true,
		},
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/accounts/create started");
		let data = null;
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			data = await stripe.accounts.retrieve(inputs.account_id);
		} catch (err) {
			sails.log.error(`Error in helper stripe/accounts/create. ${err}`);
		}
		return exits.success(data);
	},
};
