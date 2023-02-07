module.exports = {
	friendlyName: "Get",

	description: "Get cards",

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
			"Running user/cards/get.js with inputs " + JSON.stringify(inputs)
		);

		try {
			// let card_response = await sails.helpers.stripe.cards.get(inputs.user.customer_id)
			// if (!card_response.cards) {

			//   return exits.ok({
			//     status: false,
			//     message: "Cards not found",
			//   });
			// }
			// for (card of card_response.cards) {
			//   let obj = {
			//     user_id: inputs.user.id,
			//     card_id: card.id,
			//     brand: card.brand,
			//     country: card.country,
			//     exp_month: card.exp_month,
			//     exp_year: card.exp_year,
			//     last4:card.last4

			//   }
			//   await User_card.createOrUpdateCard({ card_id:card.id,user_id:inputs.user.id }, obj);
			// }
			let cards = await User_card.find({
				where: { user_id: inputs.user.id },
				select: [					
					"card_id",
					"brand",
					"country",
					"exp_month",
					"exp_year",
					"last4",
					"is_selected",
				],
      }).sort([
        { is_selected: 'DESC' },
        { id: 'DESC' },
      ]);
      if (!cards.length) {
        return exits.ok({
          status: false,
          message: "Cards not found",          
        });
      }
      for (card of cards) {
        card.id = card.card_id
        delete card.card_id
      }
			return exits.success({
				status: true,
				message: "Cards Listed Successfully",
				data: cards,
			});
		} catch (err) {
			sails.log.error("error calling user/cards/get.js", err.message);
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
