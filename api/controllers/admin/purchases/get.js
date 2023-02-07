const { getAhaCommission } = require("../../../util");
module.exports = {
	friendlyName: "Get purchases",

	description: "Get all purchases.",

	inputs: {
		// admin: {
		//   type: 'ref',
		//   required: true,
		//   description: 'logged in admin'
		// },
		query: {
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
			"Running admin/purchases/get.js with inputs " + JSON.stringify(inputs)
		);
		try {
			let query = null;
			if (inputs.query) {
				query = JSON.parse(inputs.query);
			} else {
				query = this.req.query;
			}

			sails.log({ reqQuery: JSON.stringify(query) });
			let range = [0, 9];
			if (query.range) {
				range = JSON.parse(query.range);
			}

			var sort = await sails.helpers.getSortFilters(query, true);

			let where = { id: { "!=": null } };
			if (query.filter) {
				var filter = JSON.parse(query.filter);

				if (filter.q) {
					filter.q = filter.q.toLowerCase();
					where.or = [{ title: { contains: filter.q } }];
					if (parseInt(filter.q)) {
						where.or.push({ id: parseInt(filter.q) });
					}
					let artist_art_ids = await Art.searchOrderArtIdsByArtist(filter.q);
					if (artist_art_ids.length) {
						where.or.push({ art_id: artist_art_ids });
					}
					let user_art_ids = await Art.searchOrderArtIdsByUser(filter.q);
					if (user_art_ids.length) {
						where.or.push({ art_id: user_art_ids });
					}
				}
				if (filter.id) {
					where.id = filter.id;
				}
				if (filter.user_id) {
					let user_order_ids = await Order.getUserOrderIds({
						user_ids: [filter.user_id],
					});
					where.order = user_order_ids;
				}
			}

			// let order = sort[0];
			// order = Object.keys(order).map((key) => [key, order[key]])[0];
			// sails.log({ oder: order });

			sails.log({ sortaaaaa: sort });
			let purchases = await Order_art.find({
				where: where,
				select: [
					"id",
					"title",
					"price",
					"quantity",
					"size",
					"shipment_charges",
          "artist_id",
          "art_id",
          "tracking_url",
          "shippo_label_url"
				],
			})
				.populate("order")
				.populate("status")
				.skip(range[0])
				.limit(range[1] - range[0] + 1)
				.sort(sort);
			if (purchases.length) {
        // artist_ids = _.map(purchases, "artist_id");
        artist_ids = _.map(purchases, function(obj) { if(obj.artist_id)return obj.artist_id; });
				let artists = await User.find({
					where: { user_id: artist_ids },
					select: ["user_id", "username", "name"],
				});

				user_ids = _.map(purchases, "order");
				user_ids = _.map(user_ids, "user_id");
				let users = await User.find({
					where: { user_id: user_ids },
					select: ["user_id", "username", "name"],
				});
				purchases[0].total = await Order_art.count({ where: where });
				purchases = _.map(purchases, function (o) {
					o.total_amount = o.price * o.quantity;

					o.artist_share = o.total_amount - getAhaCommission(o.total_amount);
					o.aha_commission = getAhaCommission(o.total_amount);

					o.user = _.find(users, { user_id: o.order.user_id });
					delete o.user_id;
					if (
						!_.isUndefined(filter) &&
						filter.trim_title_length &&
						o.title.length > 15
					) {
						o.title =
							o.title.substring(0, parseInt(filter.trim_title_length)) + "...";
					}
					o.status = o.status.display_name;

          o.artist = _.find(artists, { user_id: o.artist_id });
          o.shipment_charges = o.shipment_charges > 0 ?parseFloat(o.shipment_charges):0
					return o;
				});

				return exits.success({
					status: true,
					message: `${purchases.length} records found`,
					data: purchases,
				});
			}
			return exits.ok({
				status: false,
				message: "",
				data: [],
			});
		} catch (err) {
			sails.log.error("error calling admin/purchases/get.js", err.message);
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
