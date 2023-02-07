const { getAhaCommission } = require("../../../util");

module.exports = {
	friendlyName: "Get",

	description: "Get transactions",

	inputs: {
		user: {
			type: "ref",
		},
		offset: {
			type: "number",
			defaultsTo: 0,
		},
		limit: {
			type: "number",
			defaultsTo: 1000,
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
		let data = {};
		try {
			data.wallet = inputs.user.wallet;
			data.pending_amount = parseFloat(inputs.user.pending_amount);
			data.available_amount = parseFloat(inputs.user.available_amount);
			data.total_amount = parseFloat(inputs.user.total_amount);
			data.withdrawal_requested = inputs.user.withdrawal_requested;
			data.transactions = await Artist_wallet_history.getArtistWalletHistory(
				inputs.user.id,
				inputs.offset,
				inputs.limit
			);
			if (data.transactions.length) {
				// for (transaction of data.transactions) {
				// 	transaction.amount = transaction.price* transaction.quantity
				// 	aha_commission = getAhaCommission(transaction.amount);
				// 	transaction.amount -= aha_commission 
				// 	transaction.order_date = transaction.createdAt
				// 	delete transaction.createdAt
				// 	delete transaction.price
				// 	delete transaction.quantity
					
				// }
			}
		
			return exits.success({
				status: true,
				message: `Transactions Listed Successfully`,
				data: data,
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
				message: "Unknown server error.",
			});
		}
	},
};
