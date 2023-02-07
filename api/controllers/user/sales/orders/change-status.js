const { updateWallets, updateAmounts } = require("../../../../util");
const shippo = require("shippo")(sails.config.shippo.api_token);
module.exports = {
	friendlyName: "Change",

	description: "Change order status",

	inputs: {
		user: {
			type: "ref",
		},
		order_art_id: {
			type: 'number',
			required:true
		},		
		status: {
			type: "string",
			isIn: ["inqueue", "processing", "dispatched", "completed", "cancelled","all"],
			required:true
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
			"Running user/sales/orders/change-status.js with inputs " + JSON.stringify(inputs)
		);
		let data = {}
		try {
			let order_art = await Order_art.findOne({ id: inputs.order_art_id }).populate('order').populate('art_id')
			if (!order_art) {
				return exits.ok({
					status: false,
					message: "Order not found",					
				});
			}
			order_art.shippable = order_art.art_id.shippable
			order_art.art_id = order_art.art_id.id
			if (order_art.shippable === true && inputs.status === global.STATUS.DISPATCHED) {
				return exits.ok({
					status: false,
					message: "You can not dispatch a shippable order manually",					
				});
			}
			let order = { ...order_art.order }
			order_art.order = order.id
			let statuses = await sails.helpers.statuses.get();	
			let filter_obj = { artist_id: inputs.user.id, status_ids:[], order_ids:[order.id], art_ids:[order_art.art_id]}
			let order_ids = await Order.getArtistOrderIds(filter_obj)
			if (!order_ids.length) {
				return exits.ok({
					status: false,
					message: "Order not found",					
				});
			}
			 order_art = await Order_art.update({ id:order_art.id }).set({ status: statuses[inputs.status.toLowerCase()] }).fetch()			
			switch (inputs.status.toLowerCase()) {
				case global.STATUS.PROCESSING:
					//check if order's shipment is enabled ,then make shippo transaction
					if (order_art[0].shippo_rate_id) {
						transaction = await shippo.transaction.create({
							rate: order_art[0].shippo_rate_id,
							label_file_type: "PDF",
							async: false,
						});
						
						if (transaction.status === global.SHIPPO_STATUS.ERROR) {
							await Order_art.update({ id: order_art[0].id }).set({								
								status: statuses[global.STATUS.INQUEUE],								
							});		
							return exits.ok({
								status: false,
								message: transaction.messages[0].text,
							});
						}
						data.tracking_url = transaction.tracking_url_provider
						data.shippo_label_url = transaction.label_url
							
						await Order_art.update({ id: order_art[0].id }).set({
							shippo_transaction_id: transaction.object_id,
							tracking_url: transaction.tracking_url_provider,
							status: statuses[global.STATUS.PROCESSING],
							shippo_label_url:transaction.label_url
						});						
					}
					break;
				case global.STATUS.COMPLETED:
					await updateWallets(order_art, order.id);
					await updateAmounts(order_art,'available_amount');
					await updateAmounts(order_art,'pending_amount','-');
					break;
				case global.STATUS.CANCELLED:
					await updateAmounts(order_art, 'pending_amount', '-');
					if (order.charge_id) {
						//just refund for the artist's item which is being cancelled from order
						let refund_amount = order_art[0].price * order_art[0].quantity
						if (order_art[0].shippo_rate_id) { 
							let rate = await shippo.rate.retrieve(order_art[0].shippo_rate_id);
							if (rate) {
								refund_amount += parseInt(rate.amount)
							}
						}
						let metadata = { order_id: order.id, order_art_id: order_art[0].id };
						let payment_info = await sails.helpers.stripe.refunds.create(
							order.charge_id,						
							metadata,
							refund_amount
						);					
						if (!_.isUndefined(payment_info.result) && payment_info.result.status == 'succeeded') {
							///refund succeeds, perform action accordingly
							// await sails.helpers.notifications.sendAndSave(sails.config.notification.type.order_status_changed,{order_art:order_art[0],user:inputs.user,status:inputs.status});
						}
						if (order_art[0].shippo_transaction_id) {
							///refund from shippo to AHA
							shippo.refund.create({
								transaction: order_art[0].shippo_transaction_id,
								async: false
							}, function (err, refund) {
								// asynchronously called
								console.log({ErrorInShippoRefund:err,refund})
							});
						}
						
					}					
					break;
			}
			await sails.helpers.notifications.sendAndSave(sails.config.notification.type.order_status_changed,{order_art:order_art[0],user:inputs.user,status:inputs.status});
			return exits.success({
				status: true,
				message: "Status Changed Successfully",
				data: data,
			});
		} catch (err) {
			sails.log.error("error calling user/sales/orders/change-status.js", err.message);
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
