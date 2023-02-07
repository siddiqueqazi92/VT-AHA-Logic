module.exports = {
	friendlyName: "Get",

	description: "Get withdrawals",

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
			"Running user/withdrawals/request.js with inputs " +
				JSON.stringify(inputs)
		);
		if (inputs.user.available_amount <= 0) {
			return exits.ok({
				status: false,
				message: "Your available amount is 0",
			});
		}
		try {
			let created = await Withdrawal_request.createOne(inputs.user);
			if (!created) {
				return exits.ok({
					status: false,
					message: "Unable to send request",
				});
			}
			return exits.success({
				status: true,
				message: `Your request has been recorded, we will get back to you with in 3 working days.`,
			});
		} catch (err) {
			sails.log.error("error calling user/withdrawals/request.js", err.message);
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
				message: "Unknown server error.",
			});
		}
	},
};
