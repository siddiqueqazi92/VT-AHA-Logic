

async function abc() {
	// let order_arts = await Order_art.find({ where: { artist_id: null } }).populate("art_id")
	// if (order_arts.length) {
	// 	for (oa of order_arts) {
	// 		await Order_art.update({art_id:oa.art_id.id}).set({artist_id:oa.art_id.artist_id})
	// 	}
	// }
	let order_arts = await Order_art.find({ where: { status: { "!=":1} } })
	if (order_arts.length) {
		for (oa of order_arts) {
			await Artist_wallet_history.update({art:oa.art_id,order:oa.order}).set({order_art:oa.id})
		}
	}
}
module.exports = {
	friendlyName: "Get",

	description: "Get  sales orders of artist",

	inputs: {
		user: {
			type: "ref",
		},
		status: {
			type: "string",
			isIn: ["inqueue", "processing", "dispatched", "completed", "cancelled","all","returned"],
			defaultsTo:"all"
		},
		filter: {
			type: "string",
			defaultsTo: "all",
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
			"Running user/sales/orders/get.js with inputs " + JSON.stringify(inputs)
		);
		// await abc();
		let data = []
		try {
			let statuses = await sails.helpers.statuses.get();
			let status_ids = []
			if (inputs.status && inputs.status.toLowerCase() != 'all') {				
				status_ids.push(statuses[inputs.status.toLowerCase()])
			}
			let filter_obj = { artist_id: inputs.user.id, status_ids:status_ids,filter:inputs.filter}
			let order_ids = await Order.getArtistOrderIds(filter_obj)
			if (!order_ids.length) {
				return exits.ok({
					status: true,
					message: "Orders not found",
					data: data,
				});
			}
			let where = { order: order_ids,artist_id:inputs.user.id }
			if (inputs.status && inputs.status.toLowerCase() != 'all') {				
				where.status = statuses[inputs.status.toLowerCase()]
			} 
			data = await Order_art.getOrderArts(where,inputs.offset,inputs.limit);
			data.forEach(function(v){ delete v.status });
			return exits.success({
				status: true,
				message: `${data.length} Orders Listed Successfully`,
				data: data,
			});
		} catch (err) {
			sails.log.error("error calling user/sales/orders/get.js", err.message);
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
