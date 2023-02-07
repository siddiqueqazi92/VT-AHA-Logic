
const { addUserInCommunities, updateAmounts } = require("../../../util");

module.exports = {
	friendlyName: "Create",

	description: "Create order",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		cart: {
			type: "ref",
			required: true,
		},
		subtotal: {
			type: "number",
			required: false,
		},
		total: {
			type: "number",
			required: false,
		},
		shipment_charges: {
			type: "number",
			required: false,
		},
		address: {
			type: "ref",
			required: false,
		},
		card_id: {
			type: "string",
			required: false,
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
		sails.log("action user/orders/create started");
		sails.log('inputs:',inputs)
		try {
			if (inputs.subtotal >= 999999 || inputs.total >= 999999) {
				return exits.ok({
					status: false,
					message: "You can not place order of more than $999,999",
				});
			}
			let is_valid_address = await sails.helpers.shippo.addresses.isValid(inputs.address.title, inputs.address.country, inputs.address.state, inputs.address.city, inputs.address.zip, inputs.address.street)
            if (is_valid_address.is_valid === false) {
              return exits.ok({
                status: false,
                message: is_valid_address.message || 'Invalid address',          
              });
            }
			let obj = { ...inputs };
			obj.user_id = inputs.user.id;
			let cart = inputs.cart ;
			let address = inputs.address;
			inputs.address.name = inputs.address.title
			let temp_cart = [...obj.cart]
			inputs.address.name = inputs.address.title
			let shipment_data = await sails.helpers.shippo.shipments.calculateCharges(temp_cart, inputs.address)

			let shipment_art =_.filter(inputs.cart, function(elem) { return elem.template !== null && !_.isEmpty(elem.template); }); 
			if (shipment_art.length > 0) { 
				if (shipment_data.length <= 0 || (!_.isUndefined(shipment_data[0].total_shipping_charges) && shipment_data[0].total_shipping_charges === 0)) {
					return exits.ok({
						status: false,
						message: "There is a problem calculating shipment charges. This order can not proceed. Sorry for the inconvenience.",					
					});
				}
			
			}	
			delete obj.cart;
			delete obj.address.id;
			delete obj.address;
			delete obj.user;

			if (cart.length) {
				let deleted_art_count = await Art.count({
					id: _.map(cart, "id"),
					deletedAt: { "!=": null },
				});
				if (deleted_art_count) {
					return exits.ok({
						status: false,
						message: "Some item(s) have been removed by artist",
					});
				}
				let art_sizes = await Art_size.find({
					where: { art: _.map(cart, "id") },
					select: ["art", "size", "price", "quantity"],
				});
				let art_with_qty = await Art.find({
					where: { id: _.map(cart, "id") },
					select: ["id", "max_quantity", "price", "artist_id"],
				});
				let subtotal = 0;
				for (item of cart) {
					temp_art = _.find(art_with_qty, { id: item.id });
					item.artist_id = temp_art.artist_id;
					if (item.size) {
						_size = _.find(art_sizes, { art: item.id, size: item.size });
						if (!_size) {
							return exits.ok({
								status: false,
								message: "Size not available",
							});
						}
						quantity = _size.quantity;
						item_actual_price = _size.price;
					} else {
						quantity = temp_art.max_quantity;
						item_actual_price = temp_art.price;
					}
					item_actual_price = parseFloat(item_actual_price);
					if (item.price !== item_actual_price) {
						item.price = item_actual_price;
					}
					if (item.quantity > quantity) {
						return exits.ok({
							status: false,
							message: "Some item(s) are sold out",
						});
					}
					subtotal += item.price * item.quantity;
				}
				obj.subtotal = subtotal;
				obj.total = subtotal + obj.shipment_charges;
			}
			let statuses = await sails.helpers.statuses.get([global.STATUS.INQUEUE]);
			obj.status = statuses[global.STATUS.INQUEUE];
			let order = await Order.create(obj).fetch();
			if (order) {
				if (cart.length) {
					cart = cart.map((o) => {
						(o.order = order.id), (o.art_id = o.id);
						o.status = statuses[global.STATUS.INQUEUE];
						delete o.id;
						return o;
					});
					var order_arts = await Order_art.createEach(cart).fetch();
				}

				if (!_.isEmpty(address)) {
					address.order = order.id;
					let order_address = await Order_address.create(address).fetch();
				}
			}
			let metadata = {};
			metadata.order_id = order.id;
			metadata.title = inputs.cart[0].title;
			metadata.product_count = inputs.cart.length;

			if (inputs.card_id) {	
				
				if (shipment_data.length) {
					let art_ids = []
					for (let obj of shipment_data) {
						for (parcel of obj.parcels) {
							art_ids.push( parcel.metadata.split(":")[1])
						}
						if (art_ids.length) {
							// let rate = await shippo.rate.retrieve(obj.shipping_rate.object_id);
							// if (rate) {
							// 	sc = parseFloat(rate.amount)
							// }
							sc = parseFloat(obj.shipping_rate.amount)
							await Order_art.update({order:order.id,art_id:art_ids}).set({shippo_rate_id:obj.shipping_rate.object_id,shipment_charges:sc})
							art_ids = []
						}
					}
					
				}
				let payment_info = await sails.helpers.stripe.charges.create(
					parseInt(obj.total * 100),
					inputs.card_id,
					"usd",
					inputs.user.customer_id,
					metadata
				);
				sails.log({ payment_info });
				let card = await User_card.find({
					where: { card_id: inputs.card_id },
					select: ["brand"],
				});
				if (card.length) {
					await Order.update({ id: order.id }).set({
						card: JSON.stringify(card[0]),
					});
				}
				if (payment_info.error) {
					sails.log.error(
						`Error in action user/orders/create. Stripe Error: ${JSON.stringify(
							payment_info.error
						)}`
					);
					await Order.cancelOrder(order.id);
					return exits.ok({
						status: false,
						// message: "You can place order between $0.5 to $999,999",
						message: payment_info.error.message,
					});
        }
        await Order.update({ id: order.id }).set({
          charge_id: payment_info.result.id,
        });
			}
			for (item of order_arts) {
				await sails.helpers.notifications.sendAndSave(
					sails.config.notification.type.order_placed,
					{ order, item: item, user: inputs.user }
				);
			}

			await Art.updateQuantity(cart);
			addUserInCommunities(inputs.user.id, cart);
			await updateAmounts(cart, "pending_amount");

			let updated_arts = await Art.getAllWithSizes(
				{ id: _.map(inputs.cart, "art_id") },
				["id", "max_quantity"]
			);
			sails.log("action user/orders/create ended");
		
			let where = {user_id:inputs.user.id,id:order.id}		   			
			return exits.success({
				status: true,
				message: "Order created successfully",
				data: updated_arts,
				order:await Order_art.getOrder(where)
			});
		} catch (err) {
			sails.log.error(`Error in action user/orders/create. ${err}`);
			return exits.invalid(err.message || "Server error: can not create order");
		}
	},
};
