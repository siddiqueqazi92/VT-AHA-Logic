const { formatAmount } = require("../../../util");

module.exports = {
	friendlyName: "Get",

	description: "Get sales",

	inputs: {
		user: {
			type: "ref",
		},
		filter: {
			type: "string",
			defaultsTo: "all",
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
			"Running user/sales/get.js with inputs " + JSON.stringify(inputs)
		);
		let data = {
			data: [],
			total: 0,
			inqueue: 0,
			processing: 0,
			dispatched: 0,
			cancelled: 0,
			completed: 0,
		};
		try {
			let sales = await Artist_wallet_history.getArtistSales(
				inputs.user.id,
				inputs.filter
			);
			let order_counts = await Order_art.getArtistOrdersCount(
				inputs.user.id,
				inputs.filter
			);
			if (sales.length) {
				if (inputs.filter == "daily") {
					data.order_date = sales[0].order_date;
				}
				data.data = _.map(sales, "amount");
				data.data = data.data.map((i) => parseFloat(i));
				data.data.unshift(0)
				let formatted_amounts = []
				for (amount of data.data) {					
					formatted_amounts.push(formatAmount(amount,1))
				}
				data.data2 = formatted_amounts
			data.total = _.sum(data.data);
			}
			
			
			data = _.merge({ ...data, ...order_counts });
			return exits.success({
				status: true,
				message: "Sales Listed Successfully",
				data: data,
			});
		} catch (err) {
			sails.log.error("error calling user/sales/get.js", err.message);
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
