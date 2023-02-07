/**
 * Artist_wallet_history.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "artist_wallet_history",
	attributes: {
		createdAt: false,
		updatedAt: false,
		artist_id: {
			type: "string",
			required: true,
		},
		order: {
			model: "order",
			columnName: "order_id",
		},
		art: {
			model: "art",
			columnName: "art_id",
		},
		order_art: {
			model: "order_art",
			columnName: "order_art_id",
		},
		title: {
			type: "string",
		},
		amount: {
			type: "number",
			required: true,
		},
		supportable: {
			type: "boolean",
		},
	},
	customToJSON: function () {
		if (this.order && _.isObject(this.order_art)) {
			this.order_date = this.order_art.updatedAt;
			delete this.order_art;
		}
		return _.omit(this, ["artist_id","art"]);
	},
	getArtistWalletHistory2: async function (artist_id,offset = 0, limit = 1000) {
		let history = [];
		try {
			let statuses = await sails.helpers.statuses.get([global.STATUS.COMPLETED]);	
			history = await Order_art.find({
				where: { artist_id, status: statuses[global.STATUS.COMPLETED] },
				select: ['title','price','quantity','createdAt']
			}).skip(offset).limit(limit).sort("id DESC");
		} catch (err) {
			sails.log.error(
				`Error in model Artist_wallet_history, function getArtistWalletHistory. ${err}`
			);
		}
		return history;
	},
	getArtistWalletHistory: async function (artist_id,offset = 0, limit = 1000) {
		let history = [];
		try {
			history = await Artist_wallet_history.find({
				where: { artist_id },
			}).populate("order_art").skip(offset).limit(limit).sort("id DESC");
		} catch (err) {
			sails.log.error(
				`Error in model Artist_wallet_history, function getArtistWalletHistory. ${err}`
			);
		}
		return history;
	},

	getArtistSales2: async function (artist_id,filter = 'all') {
		let sales = [];
		try {
			let statuses = await sails.helpers.statuses.get([global.STATUS.CANCELLED]);	
			let where = `oa.artist_id = '${artist_id}' AND oa.status_id != ${statuses[global.STATUS.CANCELLED]}`
			switch (filter) {
				case 'daily':
					//where createdAt is greater than 12 AM of current date
					where += ` and oa."createdAt" >= now()::date + interval '0m'`
					break;
				case 'weekly':				
					//where createdAt is greater than last sunday
					where += `  and oa."createdAt"::TIMESTAMP::DATE > NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER`;
					break;
				case 'monthly':
				//where createdAt is greater than or equal to 1st of current month
				where += ` and oa."createdAt" >= date_trunc('month', current_date )`;
					break;
			}
			let query = `
			select round( (oa.price*oa.quantity - oa.price*${global.AHA_COMMISSION}/100 *oa.quantity), 0 ) as amount, 
			oa.id as oa_id,oa."createdAt" as order_date
			from order_arts oa
			where ${where}			
			`
			sails.log(query)
			let result = await sails.sendNativeQuery(query)
			sales = result.rows
		} catch (err) {
			sails.log.error(
				`Error in model Artist_wallet_history, function getArtistSales. ${err}`
			);
		}
		return sales;
	},
	getArtistSales: async function (artist_id,filter = 'all') {
		let sales = [];
		try {
			let statuses = await sails.helpers.statuses.get([global.STATUS.CANCELLED]);	
			let where = `oa.artist_id = '${artist_id}' AND oa.status_id != ${statuses[global.STATUS.CANCELLED]}`
			switch (filter) {
				case 'daily':
					//last 7 days
					where += ` and oa."createdAt" > current_date - interval '7 days'`
					break;
				case 'weekly':				
					//last 30 days
					where += ` and  oa."createdAt" > now() - interval '30 day'`;
					break;
				case 'monthly':
				//where createdAt lies in last 12 months
				// where += ` and date_part('year', oa."createdAt") = date_part('year', CURRENT_DATE)`;
				where += ` and oa."createdAt" > date_trunc('month', CURRENT_DATE) - INTERVAL '1 year'`;
					break;				
			}
			let query = `
			select round( (oa.price*oa.quantity - oa.price*${global.AHA_COMMISSION}/100 *oa.quantity), 0 ) as amount, 
			oa.id as oa_id,oa."createdAt" as order_date,to_char(oa."createdAt", 'Day') as day,to_char(oa."createdAt", 'Mon') as month,
			TO_CHAR(oa."createdAt",'W') AS week,to_char(oa."createdAt", 'yy') as year
			from order_arts oa
			where ${where}		
			order by oa."createdAt" desc	
			`
			sails.log(query)
			let result = await sails.sendNativeQuery(query)
			sales = result.rows
		} catch (err) {
			sails.log.error(
				`Error in model Artist_wallet_history, function getArtistSales. ${err}`
			);
		}
		return sales;
	},
};
