module.exports = {
	friendlyName: "Change order privacy",

	description: "",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		order_id: {
			type: "number",
			required: true,			
		},
		is_public: {
			type: "boolean",
			required: true,
		},
	},

	exits: {
		ok: {
			responseType: "ok",
			description: "",
		},
		invalid: {
			responseType: "badRequest",
			description: "",
		},
	},

	fn: async function (inputs, exits) {
		sails.log("action user/orders/change-privacy started");
		try {
			let where = { id: inputs.order_id, user_id: inputs.user.id };
			let order = await Order.findOne(where);
			if (!order) {
				return exits.ok({
					status: false,
					message: "Invalid Order ID",
				});
			}

			let updated = await Order.updateOne(where, {
				is_public: inputs.is_public,
			});

			sails.log("action user/orders/change-privacy ended");
			return exits.success({
				status: true,
				message: "Processed successfully",
				data: updated,
			});
		} catch (err) {
			sails.log.error(`Error in action user/orders/change-privacy. ${err}`);
			return exits.invalid(
				err.message || "Server error: can not change privacy of user's order"
			);
		}
	},
};
