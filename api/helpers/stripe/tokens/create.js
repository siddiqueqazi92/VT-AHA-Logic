module.exports = {
	friendlyName: "Create token",

	description: "",

	inputs: {
		card: {
			type: "ref",
			required: true,
		},	
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/tokens/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			
			const token = await stripe.tokens.create({
				card: {
				  number: '4242424242424242',
				  exp_month: 1,
				  exp_year: 2023,
				  cvc: '314',
				},
				// card:inputs.card
			  });
			if (token) {
				data.token = token;
			}
			return exits.success(data);
		} catch (err) {
			sails.log.error(`Error in helper stripe/tokens/create. ${err}`);
			return exits.success(data);
		}
	},
};
