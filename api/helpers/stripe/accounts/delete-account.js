module.exports = {
	friendlyName: "delete account",

	description: "",

	inputs: {
		account_id: {
			type: 'string',
			required:true
		}
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/accounts/delete started");
		let deleted = false
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);			

			const response = await stripe.accounts.del(inputs.account_id);
			deleted = response && response.deleted == true
			
		} catch (err) {
			sails.log.error(`Error in helper stripe/accounts/delete. ${err}`);
			2
		}
		return exits.success(deleted);
	},
};
