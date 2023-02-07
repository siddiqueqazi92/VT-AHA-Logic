module.exports = {
	friendlyName: "Get",

	description: "Get transactions",

	inputs: {
		user: {
			type: "ref",
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
			"Running user/transactions/get.js with inputs " + JSON.stringify(inputs)
		);

		try {
			if (!inputs.user.customer_id) {
				return exits.ok({
					status: false,
					message: "Transactions not found",
				});
			}
			let stripe_response = await sails.helpers.stripe.charges.get(
				inputs.user.customer_id
			);
			if (!stripe_response.charges) {
				return exits.ok({
					status: false,
					message: "Transactions not found",
				});
      }
      for (charge of stripe_response.charges) {
        charge.amount = charge.amount/100
        charge.amount_captured = charge.amount_captured/100
      }
			return exits.success({
				status: true,
				message: "Transactions Listed Successfully",
				data: stripe_response.charges,
			});
		} catch (err) {
			sails.log.error("error calling user/transactions/get.js", err.message);
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
