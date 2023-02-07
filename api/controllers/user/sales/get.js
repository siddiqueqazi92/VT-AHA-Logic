const { formatAmount } = require("../../../util");
const lodash = require("lodash");
const moment = require("moment");
function getLastWeeks(limit = 5) {
	let weeks = [];
	for (i = -(limit - 1); i <= 0; i++) {
		weeks.push(getWeekRange(i));
	}
	return weeks
}

function getWeekRange(week = 0) {
	var weekStart = moment().add(week, "weeks").startOf("week");

	return [...Array(7)].map((_, i) =>
		weekStart.clone().add(i, "day").format("DD/MM/YYYY")
	);
}
function isInArray(array, value) {
	return (array.find(item => {return item == value}) || []).length > 0;
}

module.exports = {
	friendlyName: "Get",

	description: "Get sales",

	inputs: {
		user: {
			type: "ref",
		},
		filter: {
			type: "string",
			defaultsTo: "all",
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
			"Running user/sales/get.js with inputs " + JSON.stringify(inputs)
		);
		let data = {
			data: [],
			total: 0,
			inqueue: 0,
			processing: 0,
			dispatched: 0,
			completed: 0,
			cancelled: 0,
			returned: 0,
			
		};
		try {
			
			let sales = await Artist_wallet_history.getArtistSales(
				inputs.user.id,
				inputs.filter
			);
			let order_counts = await Order_art.getArtistOrdersCount(
				inputs.user.id,
				inputs.filter
			);
			let sales_data = { daily: [], weekly: [], monthly: [],all:[] }
			for (let i = 6; i >= 0 ; i--){
				sales_data.daily.push({ x: moment().subtract(i,'d').format('dddd'),y:0 } )
			}
			for (let i = 1; i <= 5 ; i++){
				sales_data.weekly.push({ x: `W${i}`,y:0 } )
			}
			for (let i = -11; i <= 0 ; i++){
				sales_data.monthly.push({ x: moment().add(i, 'months').format('MMM, YY'),y:0 } )
			}
			if (sales.length) {
				if (inputs.filter == "daily") {
					data.order_date = sales[0].order_date;
				}
				// data.data = _.map(sales, "amount");
				// data.data = data.data.map((i) => parseFloat(i));
				// data.data.unshift(0)
				// let formatted_amounts = []
				// for (amount of data.data) {
				// 	formatted_amounts.push(formatAmount(amount,1))
				// }
				// data.data2 = formatted_amounts
				// data.total = _.sum(data.data);

				switch (inputs.filter) {
					case "daily":						
						for (let obj of sales) {							
							let index = sales_data.daily.findIndex(_element => _element.x === `${obj.day.trim()}`);
							if (index > -1) {
								sales_data.daily[index].y += parseInt(obj.amount)
							} else {
								sales_data.daily.push({
									x: `${obj.day.trim()}`,
									y: parseInt(obj.amount)
								})
							}			
						}
						break;
					case "weekly":
						let weeks = getLastWeeks(5);												
						for (let obj of sales) {
							let day = moment(obj.order_date).format("DD/MM/YYYY")							
							for (let i = 0; i < weeks.length; i++){
								exist = isInArray(weeks[i], day)
								if (exist !== false) {
									let index = sales_data.weekly.findIndex(_element => _element.x === `W${i + 1}`);
									if (index > -1) {
										sales_data.weekly[index].y += parseInt(obj.amount)
									} else {
										sales_data.weekly.push({
											x: `W${i+1}`,
											y: parseInt(obj.amount)
										})
									}	
								}
														
							}
						}					
						break;
					case "monthly":														
						for (let obj of sales) {																																				
							let index = sales_data.monthly.findIndex(_element => _element.x === `${obj.month.trim()}, ${obj.year}`);
							if (index > -1) {
								sales_data.monthly[index].y += parseInt(obj.amount)
							} else {
								sales_data.monthly.push({
									x: `${obj.month.trim()}, ${obj.year}`,
									y: parseInt(obj.amount)
								})
							}																														
						}
						sales_data.all = sales_data.monthly
						break;
					case "all":											
						for (let obj of sales) {																																				
							let index = sales_data.all.findIndex(_element => _element.x === `${obj.month.trim()}, ${obj.year}`);
							if (index > -1) {
								sales_data.all[index].y += parseInt(obj.amount)
							} else {
								sales_data.all.push({
									x: `${obj.month.trim()}, ${obj.year}`,
									y: parseInt(obj.amount)
								})
							}																													
						}
						sales_data.all = sales_data.all.reverse()
						break;
				}
			}
			data.data = sales_data[inputs.filter]
			data = _.merge({ ...data, ...order_counts });
			data.total = lodash.sumBy(data.data, "y");

			return exits.success({
				status: true,
				message: "Sales Listed Successfully",
				data: data,
			});
		} catch (err) {
			sails.log.error("error calling user/sales/get.js", err.message);
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
