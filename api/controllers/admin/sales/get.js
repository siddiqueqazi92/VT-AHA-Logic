const { getAhaCommission } = require("../../../util");
module.exports = {
	friendlyName: "Get sales",

	description: "Get all sales.",

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
			"Running admin/sales/get.js with inputs " + JSON.stringify(inputs)
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
				}
				if (filter.id) {
					where.id = filter.id;
				}
				if (filter.artist_id) {
					let artist_art_ids = await Art.getArtIds([filter.artist_id]);
					where.art_id = artist_art_ids;
				}
			}

			// let order = sort[0];
			// order = Object.keys(order).map((key) => [key, order[key]])[0];
			// sails.log({ oder: order });

			sails.log({ sortaaaaa: sort });
			let sales = await Order_art.find({
				where: where,
				select: ["id", "title", "price", "quantity","artist_id","art_id","shipment_charges","tracking_url","shippo_label_url"],
			})
				.populate("order")
				.populate("status")
				.skip(range[0])
				.limit(range[1] - range[0] + 1)
				.sort(sort);
			if (sales.length) {
				arts = _.map(sales, "art_id");
				// artist_ids = _.map(sales, "artist_id");
				artist_ids = _.map(sales, function(obj) { if(obj.artist_id)return obj.artist_id; });
				let artists = await User.find({
					where: { user_id: artist_ids },
					select: ["user_id", "username", "name"],
				});
				sales[0].total = await Order_art.count({ where: where });
				sales = _.map(sales, function (o) {
					if (o.status) {
						o.status = o.status.display_name;
					}

					o.total_amount = o.price * o.quantity;

					o.artist_share = o.total_amount - getAhaCommission(o.total_amount);
					o.aha_commission = getAhaCommission(o.total_amount);
          o.artist = _.find(artists, { user_id: o.artist_id });
          o.shipment_charges = o.shipment_charges > 0 ?parseFloat(o.shipment_charges):0
         
          
					delete o.user_id;
					if (
						!_.isUndefined(filter) &&
						filter.trim_title_length &&
						o.title.length > 15
					) {
						o.title =
							o.title.substring(0, parseInt(filter.trim_title_length)) + "...";
					}					
					return o;
				});

				return exits.success({
					status: true,
					message: `${sales.length} records found`,
					data: sales,
				});
			}
			return exits.ok({
				status: false,
				message: "",
				data: [],
			});
		} catch (err) {
			sails.log.error("error calling admin/sales/get.js", err.message);
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
