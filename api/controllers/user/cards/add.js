module.exports = {
	friendlyName: "Save card",

	description: "",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		token: {
			type: "string",
			required: true,
		},
	},

	exits: {
		invalid: {
			responseType: "badRequest",
			description: "",
		},
		ok: {
			responseType: "ok",
			description: "",
		},
	},

	fn: async function (inputs, exits) {
		sails.log("action user/cards/add started");
		let data = {};
		try {
			let customer_id = inputs.user.customer_id;
			if (!customer_id) {
				let customer_obj = { user_id: inputs.user.id };
				if (inputs.user.contact) {
					customer_obj.phone =
						inputs.user.contact.country_code + inputs.user.contact.number;
				}
				if (inputs.user.email) {
					customer_obj.email = inputs.user.email;
				}
				if (inputs.user.username) {
					customer_obj.name = inputs.user.username;
				}
				let customer_data = await sails.helpers.stripe.customers.create.with(
					customer_obj
				);
				if (customer_data.customer) {
					customer_id = customer_data.customer.id;
					await User.updateOne({ user_id: inputs.user.id }).set({
						customer_id,
					});
				} else {
					return exits.success({
						status: false,
						message: "Please recheck your card details.",
					});
				}
			}
			let card_response = await sails.helpers.stripe.cards.add(
				customer_id,
				inputs.token
			);
			sails.log({ card_response });
			if (card_response.error) {
				return exits.ok({
					status: false,
					message: "Please recheck your card details.",
				});
			}
			let card = card_response.card;
			let obj = {
				user_id: inputs.user.id,
				card_id: card.id,
				brand: card.brand,
				country: card.country,
				exp_month: card.exp_month,
				exp_year: card.exp_year,
				last4: card.last4,
			};
			await User_card.createOrUpdateCard(
				{ card_id: card.id, user_id: inputs.user.id },
				obj
			);
			sails.log("action user/cards/add ended");
			return exits.success({
				status: true,
				message: "Card saved successfully",
				data: card,
			});
		} catch (err) {
			sails.log.error(`Error in action user/cards/add. ${err}`);
			return exits.invalid(
				err.message || "Server error: can not create user card"
			);
		}
	},
};
