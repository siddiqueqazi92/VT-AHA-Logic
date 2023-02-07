const moment = require("moment");
const { updateWallets, updateAmounts } = require("../../../util");

module.exports = {
	friendlyName: "Track",

	description: "Track order(Shippo webhook)",

	inputs: {
		body: {
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
		sails.log(
			"Shippo Tracking webhook triggered at: ",
			moment().format("DD-MMM-YYYY HH:mm:ss")
		);
		sails.log("Running user/orders/track.js with inputs");
		console.log(inputs);

		let body_data = inputs.body.data;
		try {
			let tracking_history = body_data.tracking_history;
			sails.log({ tracking_status: body_data.tracking_status.status });
			sails.log({ transaction_id: body_data.transaction });
			if (body_data.transaction) {
				let status = body_data.tracking_status.status;

				switch (status) {
					case global.SHIPPO_STATUS.DELIVERED:
						status = global.STATUS.COMPLETED;
						break;
					case global.SHIPPO_STATUS.PRE_TRANSIT:
						status = global.STATUS.PROCESSING
						break;
					case global.SHIPPO_STATUS.TRANSIT:
						status = global.STATUS.DISPATCHED;
						break;
					default:
						status = status.toLowerCase();
				}
				sails.log({ status_to_change_in_aha_db: status });
				let statuses = await sails.helpers.statuses.get([
					global.STATUS.COMPLETED,
					global.STATUS.DISPATCHED,
					global.STATUS.CANCELLED,
					global.STATUS.RETURNED,
					global.STATUS.PROCESSING,
				]);
				let order_art = await Order_art.update({
					shippo_transaction_id: body_data.transaction,
					status: {
						"!=": [
							statuses[global.STATUS.COMPLETED],
							statuses[global.STATUS.CANCELLED],
						],
					},
				})
					.set({ status: statuses[status] })
					.fetch();
				sails.log(`status '${status}' has been set to order art: `);
				sails.log(order_art)
				if (order_art.length) {
					switch (status) {
						case global.STATUS.COMPLETED:
							await updateWallets(order_art, order_art[0].order);
							await updateAmounts(order_art, "available_amount");
							await updateAmounts(order_art, "pending_amount", "-");

							break;
						case global.STATUS.CANCELLED:
						case global.STATUS.RETURNED:
							await updateAmounts(order_art, "pending_amount", "-");
							let orders = await Order.find({ id: _.map(order_art, "order") });

							//just refund for the artist's item which is being cancelled from order
							for (let oa of order_art) {
								let order = _.find(orders, { id: oa.order });
								if (!_.isUndefined(order) && order.charge_id) {
									let refund_amount = oa.price * oa.quantity;
									let metadata = { order_id: order.id, oa_id: oa.id };
									let payment_info = await sails.helpers.stripe.refunds.create(
										order.charge_id,
										metadata,
										refund_amount
									);
									sails.log(`Refunded amount: ${refund_amount}, payment_info object: `)
										sails.log(payment_info)
									if (
										!_.isUndefined(payment_info.result) &&
										payment_info.result.status == "succeeded"
									) {
										
										///refund succeeds, perform action accordingly
										// await sails.helpers.notifications.sendAndSave(sails.config.notification.type.order_status_changed,{oa:oa,user:inputs.user,status:inputs.status});
									}
									// if (oa.shippo_transaction_id) {
									// 	///refund from shippo to AHA
									// 	shippo.refund.create(
									// 		{
									// 			transaction: oa.shippo_transaction_id,
									// 			async: false,
									// 		},
									// 		function (err, refund) {
									// 			// asynchronously called
									// 			console.log({ ErrorInShippoRefund: err, refund });
									// 		}
									// 	);
									// }
								}
							}

							break;
					}
					console.log(order_art)
					await sails.helpers.notifications.sendAndSave(sails.config.notification.type.order_status_changed,{order_art:order_art[0],status});
				}
			} else {
				sails.log("No transaction id received from shippo")
			}
			sails.log("Webhook ended at: ", moment().format("DD-MMM-YYYY HH:mm:ss"));
			return exits.success({
				status: true,
				message: "Order art status updated Successfully",
			});
		} catch (err) {
			sails.log.error("error calling user/orders/track.js", err.message);
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
