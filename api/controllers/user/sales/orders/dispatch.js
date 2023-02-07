const shippo = require("shippo")(sails.config.shippo.api_token);
const moment = require("moment");
module.exports = {
	friendlyName: "Dispatch",

	description: "Dispatch orders",

	inputs: {
		user: {
			type: "ref",
		},
		order_art_ids: {
			type: "ref",
			required: true,
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
			"Running user/sales/orders/dispatch.js with inputs " +
				JSON.stringify(inputs)
		);

		let data = [];
		try {
			let order_arts = await Order_art.getOrderArtsById(
				inputs.order_art_ids,
				inputs.user.id
			);
			if (!order_arts.length) {
				return exits.ok({
					status: false,
					message: "Orders not found",
				});
			}
			let artist_address = await User_address.find({
				user_id: inputs.user.id,
				is_selected: true,
			});
			if (!artist_address.length) {
				return exits.ok({
					status: false,
					message: "Your picking point address not found",
				});
			}
			artist_address = artist_address[0];
			let statuses = await sails.helpers.statuses.get([
				global.STATUS.PROCESSING,
			]);
			let transaction_ids = [];
			for (oa of order_arts) {
				if (oa.shippo_rate_id) {
					transaction = await shippo.transaction.create({
						rate: oa.shippo_rate_id,
						label_file_type: "PDF",
						async: false,
					});
					
					if (transaction.status === global.SHIPPO_STATUS.ERROR) {
						return exits.ok({
							status: false,
							message: transaction.messages[0].text,
						});
					}
					await Order_art.update({ id: oa.id }).set({
						shippo_transaction_id: transaction.object_id,
						tracking_url: transaction.tracking_url_provider,
						status: statuses[global.STATUS.PROCESSING],
						shippo_label_url:transaction.label_url
					});
					transaction_ids.push(transaction.object_id);
				}
			}
			if (transaction_ids.length) {
				// let carrier_account = await sails.helpers.shippo.carrierAccounts.getOne("usps");
				// let pickup_obj = {
				// 	carrier_account: carrier_account.object_id,
				// 	location: {
				// 		building_location_type: "Front Door",
				// 		address: {
				// 			name: artist_address.title,
				// 			street1: artist_address.street,
				// 			city: artist_address.city,
				// 			state: artist_address.state,
				// 			zip: artist_address.zip,
				// 			country: artist_address.country,
				// 			phone: "4151234567",
				// 			email: "ubaid@goshippo.com"
				// 			// name: "Ubaid",
				// 			// street1: "965 Mission St #201",
				// 			// city: "San Francisco",
				// 			// state: "CA",
				// 			// zip: "94103",
				// 			// country: "US",
				// 			// phone: "4151234567",
				// 			// email: "ubaid@goshippo.com"
				// 		}
				// 	},
				// 	transactions: transaction_ids,
				// 	requested_start_time: "2022-10-25T19:00:00Z",
				// 	requested_end_time: "2022-10-28T19:00:00Z",
				// 	// requested_start_time: moment().add(1,'days').toISOString(),
				// 	// requested_end_time: moment().add(3,'days').toISOString(),
				// 	async: false,
				// 	is_test: true
				// }
				// let pickup = await shippo.pickup.create(pickup_obj);
				// if (pickup.status === global.SHIPPO_STATUS.CONFIRMED) {
				// 	await Order_art.update({ id: _.map(order_arts,"id") }).set({ status: statuses[global.STATUS.PROCESSING] })
				// }
				// sails.log(pickup)
			}
			//  order_art = await Order_art.update({ id:order_art.id }).set({ status: statuses[inputs.status.toLowerCase()] }).fetch()
			// switch (inputs.status.toLowerCase()) {
			// 	case global.STATUS.COMPLETED:
			// 		await updateWallets(order_art, order.id);
			// 		await updateAmounts(order_art,'available_amount');
			// 		await updateAmounts(order_art,'pending_amount','-');
			// 		break;
			// 	case global.STATUS.CANCELLED:
			// 		await updateAmounts(order_art, 'pending_amount', '-');
			// 		if (order.charge_id) {
			// 			//just refund for the artist's item which is being cancelled from order
			// 			let refund_amount = order_art[0].price*order_art[0].quantity
			// 			let metadata = { order_id: order.id, order_art_id: order_art[0].id };
			// 			let payment_info = await sails.helpers.stripe.refunds.create(
			// 				order.charge_id,
			// 				metadata,
			// 				refund_amount
			// 			);
			// 			if (!_.isUndefined(payment_info.result) && payment_info.result.status == 'succeeded') {
			// 				///refund succeeds, perform action accordingly
			// 				// await sails.helpers.notifications.sendAndSave(sails.config.notification.type.order_status_changed,{order_art:order_art[0],user:inputs.user,status:inputs.status});
			// 			}

			// 		}
			// 		break;
			// }
			// await sails.helpers.notifications.sendAndSave(sails.config.notification.type.order_status_changed,{order_art:order_art[0],user:inputs.user,status:inputs.status});
			return exits.success({
				status: true,
				message: "Status Changed Successfully",
				data: data,
			});
		} catch (err) {
			sails.log.error(
				"error calling user/sales/orders/dispatch.js",
				err.message
			);
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
