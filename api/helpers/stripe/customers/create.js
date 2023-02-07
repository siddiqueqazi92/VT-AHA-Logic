module.exports = {
	friendlyName: "Create customer",

	description: "",

	inputs: {
		user_id: {
			type: "string",
			required: true,
		},
		email: {
			type: "string",
			required: false,
		},
		phone: {
			type: "string",
			required: false,
		},
		name: {
			type: "string",
			required: false,
		},
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/customers/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			let obj = { metadata: { user_id: inputs.user_id } };
			if (inputs.email) {
				obj.email = inputs.email;
			}
			if (inputs.phone) {
				obj.phone = inputs.phone;
			}
			if (inputs.name) {
				obj.name = inputs.name;
			}
			const customer = await stripe.customers.create(obj);
			if (customer) {
				data.customer = customer;
			}
			return exits.success(data);
		} catch (err) {
			sails.log.error(`Error in helper stripe/customers/create. ${err}`);
			return exits.success(data);
		}
	},
};
