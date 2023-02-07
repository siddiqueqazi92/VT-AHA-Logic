/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "orders",
	attributes: {
		user_id: {
			type: "string",
		},
		status: {
			model: "status",
			columnName: "status_id",
		},
		invoice_id: {
			model: "invoice",
		},
		subtotal: {
			type: "number",
		},
		total: {
			type: "number",
		},
		shipment_charges: {
			type: "number",
			defaultsTo:0
		},
		card: {
			type: "string",
		},
		charge_id: {
			type: "string",
			description:"ID of Charge object in stripe"
		},
		is_public: {
			type: "boolean",
			defaultsTo: false,
		},
		arts: {
			collection: "Order_art",
			via: "order",
		},
		addresses: {
			collection: "Order_address",
			via: "order",
		},
		deletedAt: {
			type: "ref",
			columnType: "timestamp",
		},
	},
	customToJSON: function () {
		this.shipment_charges = parseFloat(this.shipment_charges);
		this.total = parseFloat(this.total);
		this.subtotal = parseFloat(this.subtotal);
		return _.omit(this, ["deletedAt", "updatedAt"]);
	},
	getArtistSaleCount: async function (artist_id) {
		let data = 0;
		try {
			let query = `
      SELECT COUNT(oa.*) AS sale_count
      FROM order_arts oa
      INNER JOIN arts a
      ON a.id = oa.art_id
      WHERE a.artist_id = '${artist_id}'
      `;
			let result = await sails.sendNativeQuery(query);
			data =
				!_.isUndefined(result.rows) && result.rows.length
					? parseInt(result.rows[0].sale_count)
					: 0;
		} catch (err) {
			sails.log(`Error in Model Art_vibe, function getArtVibes. ${err} `);
		}

		return data;
	},
	getArtistOrderIds: async function (filter_obj) {
		let data = [];
		try {
			const { artist_id, status_ids, order_ids, art_ids, filter } = filter_obj;
			let where = `oa.artist_id = '${artist_id}'`;
			if (Array.isArray(status_ids) && status_ids.length) {
				where += ` and oa.status_id in (${status_ids.toString()})	`;
			}
			if (Array.isArray(order_ids) && order_ids.length) {
				where += ` and oa.order_id in (${order_ids.toString()})	`;
			}
			if (Array.isArray(art_ids) && art_ids.length) {
				where += ` and oa.art_id in (${art_ids.toString()})	`;
			}
			if (filter) {
				switch (filter) {
					case "daily":
						where += ` and oa."createdAt" >= now()::date + interval '0m'`;
						break;
					case "weekly":
			// 			where += ` and o."createdAt" <= now()
            // and o."createdAt" >= now()::date - interval '168h'`;
						where += `  and oa."createdAt"::TIMESTAMP::DATE > NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER`;
						break;
					case "monthly":
			// 			where += ` and oa."createdAt" >= date_trunc('month', current_date - interval '1' month)
            // and oa."createdAt" < date_trunc('month', current_date)`;
						where += ` and oa."createdAt" >= date_trunc('month', current_date )`;
						break;
				}
			}
			let query = `
      select oa.order_id
      from order_arts oa         
      WHERE ${where}
      
      `;
			sails.log(query);
			let result = await sails.sendNativeQuery(query);
			data = result.rows.length > 0 ? _.map(result.rows, "order_id") : [];
		} catch (err) {
			sails.log(`Error in Model Order, function getArtistOrderIds. ${err} `);
		}

		return data;
	},
	getUserOrderCount: async function (user_id) {
		let data = 0;
		try {
			// data = await Order.count({ user_id });
			let query = `
			select count(oa.id) as total_orders
			from order_arts oa
			inner join orders o
			on o.id = oa.order_id
			where o.user_id = '${user_id}'
			`
			let result = await sails.sendNativeQuery(query)
			data = !_.isUndefined(result.rows[0]) ? parseInt(result.rows[0].total_orders) :0
		} catch (err) {
			sails.log(`Error in Model Order, function getUserOrderCount. ${err} `);
		}

		return data;
	},
	getUserOrderArtIds: async function (user_ids = []) {
		let data = [];
		try {
			let where = "oa.id IS NOT NULL";
			if (user_ids.length) {
				user_ids = "'" + user_ids.join("', '") + "'";
				where += ` AND o.user_id IN (${user_ids})`;
			}
			let query = `
      SELECT oa.art_id
      FROM order_arts oa
      INNER JOIN orders o
      ON o.id = oa.order_id
      WHERE ${where}`;
			let result = await sails.sendNativeQuery(query);
			data = result.rows.length > 0 ? _.map(result.rows, "art_id") : [];
		} catch (err) {
			sails.log(`Error in Model Order function getUserOrderArtIds. ${err} `);
		}

		return data;
	},

	getUserOrderIds: async function (filter = { user_ids :[] }) {
		let data = [];
		try {
			let where = "oa.id IS NOT NULL";
			if (filter.user_ids.length) {
				let user_ids = "'" + filter.user_ids.join("', '") + "'";
				where += ` AND o.user_id IN (${user_ids})`;
			}
			if (!_.isUndefined(filter.is_public)) {
				where += ` AND o.is_public = ${filter.is_public}`
			}
			let query = `
      SELECT oa.order_id
      FROM order_arts oa
      INNER JOIN orders o
      ON o.id = oa.order_id
      WHERE ${where}`;
			let result = await sails.sendNativeQuery(query);
			data = result.rows.length > 0 ? _.map(result.rows, "order_id") : [];
		} catch (err) {
			sails.log(`Error in Model Order function getUserOrderIds. ${err} `);
		}

		return data;
	},
	getOrders: async function (where, offset = 0, limit = 1000) {
		let data = [];
		try {
			data = await Order.find({
				where,
				select: ["id", "total", "subtotal", "shipment_charges"],
			})
				.populate("arts")
				.populate("status")
				.skip(offset)
				.limit(limit)
				.sort("id DESC");

			if (!data.length) {
				return data;
			}
			for (order of data) {
				order.title = !_.isUndefined(order.arts[0]) ? order.arts[0].title : "";
				order.description = !_.isUndefined(order.arts[0])
					? order.arts[0].description
					: "";
				order.thumbnail = !_.isUndefined(order.arts[0])
					? order.arts[0].thumbnail
					: null;
				order.status = order.status.display_name;
				order.product_count = order.arts.length;
				order.size = _.map(order.arts, "size");
				order.size =
					!_.isUndefined(order.size) && order.size.length
						? order.size[0]
						: null;
				delete order.arts;
			}
		} catch (err) {
			sails.log(`Error in Model Order function getOrders. ${err} `);
		}

		return data;
	},
	getOneOrder: async function (id, order_art_id) {
		let data = {};
		try {
			data = await Order.findOne({
				where: { id },
				select: [
					"id",
					"total",
					"subtotal",
					"shipment_charges",
					"user_id",
					"card",
				],
			})
				.populate("arts")
				.populate("addresses")
				.populate("status");

			if (!data) {
				return data;
			}
			data.product_count = data.arts.length;
			data.size = _.map(data.arts, "size");
			data.size =
				!_.isUndefined(data.size) && data.size.length ? data.size[0] : null;
			if (data.arts[0].status) {
				data.status = await Status.getStatuses([data.arts[0].status]);
				data.status = data.status[0].display_name;
			}
			if (data.card) {
				data.card = JSON.parse(data.card)
			}
			data.shipment_charges = parseFloat(data.shipment_charges || 0)
			if (order_art_id) {
				data.arts = [_.find(data.arts, { id: order_art_id })];
				data.arts[0].id = data.arts[0].art_id;
				data.shipment_charges = parseFloat(data.arts[0].shipment_charges || data.shipment_charges)
				data.status = await Status.getStatuses([data.arts[0].status]);
				data.status = data.status[0].display_name;
				data.arts[0].status = data.status;
				data.total =
					data.total -
				(data.total - data.arts[0].price * data.arts[0].quantity) + data.shipment_charges
				data.total = data.total.toFixed(2)
				data.subtotal =
					data.subtotal -
					(data.subtotal - data.arts[0].price * data.arts[0].quantity);
				delete data.arts[0].art_id;
			}

			data.title = !_.isUndefined(data.arts[0]) ? data.arts[0].title : "";
			data.description = !_.isUndefined(data.arts[0])
				? data.arts[0].description
				: "";
			data.thumbnail = !_.isUndefined(data.arts[0])
				? data.arts[0].thumbnail
				: null;

			data.address = data.addresses[0];
			
			data.user = await User.findOne({
				where: { user_id: data.user_id },
				select: ["username", "profile_image","is_artist"],
			});
			if (data.user) {
				data.user.isArtist = data.user.is_artist
				data.user.id = data.user_id;
				delete data.user_id;
			}
			delete data.addresses;

			// delete data.arts
		} catch (err) {
			sails.log(`Error in Model Order function getOneOrder. ${err} `);
		}

		return data;
	},
	cancelOrder: async function (id) {
		let updated = false;
		try {
			let statuses = await sails.helpers.statuses.get([
				global.STATUS.CANCELLED,
			]);

			updated = await sails.getDatastore().transaction(async (db) => {
				updated = await Order.updateOne({
					where: { id },
				}).set({ status: statuses[global.STATUS.CANCELLED] });
				updated = await Order_art.update({
					where: { order: id },
				}).set({ status: statuses[global.STATUS.CANCELLED] });
				return !_.isUndefined(updated) ? true : false;
			});
		} catch (err) {
			sails.log(`Error in Model Order function cancelOrder. ${err} `);
		}

		return updated;
	},
};
