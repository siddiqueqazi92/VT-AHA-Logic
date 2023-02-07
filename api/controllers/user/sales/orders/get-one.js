module.exports = {
	friendlyName: "Get one",

	description: "Get one order of artist",

	inputs: {
		user: {
			type: "ref",
		},		
		id: {
			type: "number",
			required: true,
			description:"Order art ID"
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
			"Running user/sales/orders/get-one.js with inputs " + JSON.stringify(inputs)
		);
		let data = []
		try {
			let order_art = await Order_art.findOne({ id: inputs.id })
			if (!order_art) {
				return exits.ok({
					status: false,
					message: "Order not found",					
				});
			}
			let statuses = await sails.helpers.statuses.get();
			let status_ids = []
			if (inputs.status && inputs.status.toLowerCase() != 'all') {				
				status_ids.push(statuses[inputs.status.toLowerCase()])
			}
			let filter_obj = { artist_id: inputs.user.id, order_ids:[order_art.order],art_ids:[order_art.art_id]}
			let order_ids = await Order.getArtistOrderIds(filter_obj)
			if (!order_ids.length) {
				return exits.ok({
					status: false,
					message: "Order not found",					
				});
			}
			
			// data = await Order_art.getOrderArts(where);
			data = await Order.getOneOrder(order_art.order,order_art.id);
			
			return exits.success({
				status: true,
				message: "Order Found Successfully",
				data: data,
			});
		} catch (err) {
			sails.log.error("error calling user/sales/orders/get-one.js", err.message);
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
