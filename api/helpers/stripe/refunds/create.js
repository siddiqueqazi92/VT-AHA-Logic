module.exports = {
	friendlyName: "Make payment",

	description: "",

	inputs: {
		charge_id: {
			type: "string",
			required: true,
		},
		metadata: {
			type: "ref",
			requied: false,
		},	
		amount: {
			type: 'number',
			required:false
		}
	
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/refunds/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			let input_obj = {
				charge: inputs.charge_id, //charge id					
			};

			if (inputs.metadata) {
				input_obj.metadata = inputs.metadata;
			}
			if (inputs.amount) {
				input_obj.amount = inputs.amount*100;
			}
			const refund = await stripe.refunds
				.create(input_obj)
				.then((result) => {
					sails.log.debug("Helper stripe/refunds/create ended");
					sails.log({ result });
					data.result = result;
					return exits.success(data);
				})
				.catch((err) => {
					sails.log.error(
						`Stripe Error in helper stripe/refunds/create. ${err}`
					);
					data.error = err;
					return exits.success(data);
				});
		} catch (err) {
			sails.log.error(`Error in helper stripe/refunds/create. ${err}`);
		}
		// return exits.success(data)
	},
};
