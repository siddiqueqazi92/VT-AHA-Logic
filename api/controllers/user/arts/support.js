const { updateAmounts } = require("../../../util");

module.exports = {
	friendlyName: "support",

	description: "support art",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		art_id: {
			type: "number",
			required: true,
		},
		amount: {
			type: "number",
			required: true,
		},
		card_id: {
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
		sails.log("action user/arts/support started");
		try {
			let obj = { ...inputs };
			let art = await Art.findOne({ where: { id: inputs.art_id, deletedAt:null },select:['id','artist_id','title'] });
			if (!art) {
				return exits.ok({
					status: false,
					message: "Invalid ID",
				});
			}
			let metadata = { art_id: inputs.art_id };
			let payment_info = await sails.helpers.stripe.charges.create(
				inputs.amount * 100,
				inputs.card_id,
				"usd",
				inputs.user.customer_id,
				metadata,
				"Support of art"
			);
			sails.log({ payment_info });
			if (payment_info.error) {
				sails.log.error(
					`Error in action user/arts/support. Stripe Error: ${JSON.stringify(
						payment_info.error
					)}`
				);
				return exits.ok({
					status: false,
					message: "You can not pay more than $999,999",
				});
			}
			await Artist_wallet_history.create({
				order:null,
				artist_id: art.artist_id,
				art: art.id,
				title: art.title,
				amount: inputs.amount,
				supportable:true
				
			})
			art.price = inputs.amount
			art.quantity = 1
			await updateAmounts([art],'available_amount');
			let card = await User_card.find({
				where: { card_id: inputs.card_id },
				select: ["brand"],
			});
			if (card.length) {
				obj.user_id = inputs.user.id;
				obj.card = JSON.stringify(card[0]);
				obj.art = obj.art_id;
				delete obj.user;
				delete obj.art_id;
				await Art_support.create(obj);
			}

			sails.log("action user/arts/support ended");
			return exits.success({
				status: true,
				message: "Processed successfully",
			});
		} catch (err) {
			sails.log.error(`Error in action user/arts/support. ${err}`);
			return exits.invalid(err.message || "Server error: can not support art");
		}
	},
};
