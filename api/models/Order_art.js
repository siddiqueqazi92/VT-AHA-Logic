/**
 * Order_art.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "order_arts",
  attributes: {   
    order: {
      model: "order",
      columnName:"order_id"
    },
    art_id: {
      model:"art"
    },
    artist_id: {
			type: "string",
      required: false,
      allowNull:true
		},
    status: {
      model: "status",
      columnName:"status_id"
    },
    title: {
      type:"string"
    },
    price: {
      type:"number"
    },
    size: {
      type:"string"
    },  
    quantity: {
      type:"number"
    },  
    description: {
      type:"string"
    },  
    thumbnail: {
      type:"string"
    },  
    shippo_rate_id: {
      type: "string",
      allowNull:true
    },  
    shippo_transaction_id: {
      type: "string",
      allowNull:true
    },  
    tracking_url: {
      type: "string",
      allowNull:true
    },  
    shippo_label_url: {
      type: "string",
      allowNull:true
    },  
    shipment_charges: {
      type: "number",
      defaultsTo:0
		},

  },

  getArtistOrdersCount2: async function (artist_id,filter = 'all') {
    let counts = {};
    counts[global.STATUS.INQUEUE] = 0;
    counts[global.STATUS.PROCESSING] = 0;
    counts[global.STATUS.DISPATCHED] = 0;
    counts[global.STATUS.CANCELLED] = 0;
    counts[global.STATUS.COMPLETED] = 0;
    try {
      let statuses = await sails.helpers.statuses.get();
      let where = `oa.artist_id = '${artist_id}'`
      where += ` and oa.status_id in (${statuses[global.STATUS.INQUEUE]},${statuses[global.STATUS.PROCESSING]},${statuses[global.STATUS.DISPATCHED]},${statuses[global.STATUS.CANCELLED]},${statuses[global.STATUS.COMPLETED]})`
			switch (filter) {
				case 'daily':
					where += ` and oa."createdAt" >= now()::date + interval '0m'`
					break;
        case 'weekly':				      
        where += `  and oa."createdAt"::TIMESTAMP::DATE > NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER`;
        break;
				case 'monthly':					
          where += ` and oa."createdAt" >= date_trunc('month', current_date )`;
					break;
			}
			let query = `
      select count(oa.*),oa.status_id
      from orders o
      inner join order_arts oa
      on oa.order_id = o.id
      where ${where}	
     
      group by oa.status_id					
			`
      sails.log(query)
			let result = await sails.sendNativeQuery(query)
      if (result.rows.length) {
        inqueue = _.find(result.rows,{status_id:statuses[global.STATUS.INQUEUE]})
        processing = _.find(result.rows,{status_id:statuses[global.STATUS.PROCESSING]})
        dispatched = _.find(result.rows,{status_id:statuses[global.STATUS.DISPATCHED]})
        cancelled = _.find(result.rows,{status_id:statuses[global.STATUS.CANCELLED]})
        completed = _.find(result.rows,{status_id:statuses[global.STATUS.COMPLETED]})
        counts[global.STATUS.INQUEUE] = !_.isUndefined(inqueue)?parseInt(inqueue['count']):0;
        counts[global.STATUS.PROCESSING] = !_.isUndefined(processing)?parseInt(processing['count']):0;
        counts[global.STATUS.DISPATCHED] = !_.isUndefined(dispatched)?parseInt(dispatched['count']):0;
        counts[global.STATUS.CANCELLED] = !_.isUndefined(cancelled)?parseInt(cancelled['count']):0;
        counts[global.STATUS.COMPLETED] = !_.isUndefined(completed)?parseInt(completed['count']):0;
      }
		} catch (err) {
			sails.log.error(
				`Error in model Order_art, function getArtistOrdersCount. ${err}`
			);
		}
		return counts;
  },
  getArtistOrdersCount: async function (artist_id,filter = 'all') {
    let counts = {};
    counts[global.STATUS.INQUEUE] = 0;
    counts[global.STATUS.PROCESSING] = 0;
    counts[global.STATUS.DISPATCHED] = 0;
    counts[global.STATUS.COMPLETED] = 0;
    counts[global.STATUS.CANCELLED] = 0;    
    counts[global.STATUS.RETURNED] = 0;
    try {
      let statuses = await sails.helpers.statuses.get();
      let where = `oa.artist_id = '${artist_id}'`
      where += ` and oa.status_id in (${statuses[global.STATUS.INQUEUE]},${statuses[global.STATUS.PROCESSING]},${statuses[global.STATUS.DISPATCHED]},${statuses[global.STATUS.CANCELLED]},${statuses[global.STATUS.COMPLETED]},${statuses[global.STATUS.RETURNED]})`
			switch (filter) {
				case 'daily':
          //last 7 days
          where += ` and oa."createdAt" > current_date - interval '7 days'`
					break;
        case 'weekly':				                
          //where createdAt lies in current month
					where += ` and oa."createdAt" >= date_trunc('month', current_date )`;
        break;
				case 'monthly':					          
          //where createdAt lies in current year
				where += ` and date_part('year', oa."createdAt") = date_part('year', CURRENT_DATE)`;
					break;
			}
			let query = `
      select count(oa.*),oa.status_id
      from orders o
      inner join order_arts oa
      on oa.order_id = o.id
      where ${where}	
     
      group by oa.status_id					
			`
      sails.log(query)
			let result = await sails.sendNativeQuery(query)
      if (result.rows.length) {
        inqueue = _.find(result.rows,{status_id:statuses[global.STATUS.INQUEUE]})
        processing = _.find(result.rows,{status_id:statuses[global.STATUS.PROCESSING]})
        dispatched = _.find(result.rows,{status_id:statuses[global.STATUS.DISPATCHED]})
        cancelled = _.find(result.rows,{status_id:statuses[global.STATUS.CANCELLED]})
        completed = _.find(result.rows,{status_id:statuses[global.STATUS.COMPLETED]})
        returned = _.find(result.rows,{status_id:statuses[global.STATUS.RETURNED]})
        counts[global.STATUS.INQUEUE] = !_.isUndefined(inqueue)?parseInt(inqueue['count']):0;
        counts[global.STATUS.PROCESSING] = !_.isUndefined(processing)?parseInt(processing['count']):0;
        counts[global.STATUS.DISPATCHED] = !_.isUndefined(dispatched)?parseInt(dispatched['count']):0;
        counts[global.STATUS.CANCELLED] = !_.isUndefined(cancelled)?parseInt(cancelled['count']):0;
        counts[global.STATUS.COMPLETED] = !_.isUndefined(completed)?parseInt(completed['count']):0;
        counts[global.STATUS.RETURNED] = !_.isUndefined(returned)?parseInt(returned['count']):0;
      }
		} catch (err) {
			sails.log.error(
				`Error in model Order_art, function getArtistOrdersCount. ${err}`
			);
		}
		return counts;
  },
 
  getOrderArts: async function (where,offset = 0, limit = 1000) {
		let data = [];
    try {
      
		  data = await Order_art.find({
        where,
        select: ["art_id","order", "title", "price","quantity",'size','description','thumbnail','tracking_url'],
      }).populate('status')
        .skip(offset)
        .limit(limit)
        .sort("id DESC");

      if (!data.length) {            
        return data
      }
      for (oa of data) {
        // oa.id = oa.order
        // delete oa.order_id
        oa.order_id = oa.order
        oa.title = oa.title
        // oa.description = oa.description
        // oa.thumbnail = oa.thumbnail
        oa.status = oa.status.display_name
        oa.subtotal = oa.price * oa.quantity
        oa.shipment_charges = 0
        oa.total = oa.subtotal + oa.shipment_charges
        delete oa.price
        delete oa.quantity
        delete oa.order
      }
		} catch (err) {
			sails.log(`Error in Model Order_art function getOrderArts. ${err} `);
		}
		
		return data;
  },
  getOrderArtsByNativeQuery: async function (order_ids = [],offset = 0, limit = 1000) {
		let data = [];
    try {
      
      let where = `oa.id IS NOT NULL`
      if (order_ids.length) {
        where += ` AND oa.order_id IN (${order_ids.toString()})`
      }

      let query = `
      SELECT * FROM (
      SELECT DISTINCT ON(oa.art_id) oa.id,oa.art_id,oa.order_id,oa.title,oa.price,oa.quantity,oa.size,oa.description,oa.thumbnail,s.display_name as status,oa.tracking_url
      FROM order_arts oa
      LEFT JOIN statuses s
      ON s.id = oa.status_id
      WHERE ${where}) t
      ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}
      `
      
      console.log(query)
      let result = await sails.sendNativeQuery(query)
      data = result.rows
      if (!data.length) {            
        return data
      }
      
      for (oa of data) {
        // oa.id = oa.order
        // delete oa.order_id
        oa.order_id = oa.order
        oa.title = oa.title
        // oa.description = oa.description
        // oa.thumbnail = oa.thumbnail
        oa.status = oa.display_name
        oa.subtotal = oa.price * oa.quantity
        oa.shipment_charges = 0
        oa.total = oa.subtotal + oa.shipment_charges
        delete oa.price
        delete oa.quantity
        delete oa.order
      }
		} catch (err) {
			sails.log(`Error in Model Order_art function getOrderArts. ${err} `);
		}
		
		return data;
  },
  
  getOrder: async function (where) {
    let order = null
    try {
     order = await Order.findOne({
        where,
        select: ["id", "total", "subtotal","shipment_charges","card","is_public"],
      }).populate('arts').populate('status')        

      if (!order) {            
        return exits.ok({
          status: false,
          message: "Order not found",          
        });
      }
      
        order.thumbnail = order.arts[0].thumbnail
        order.status = order.status.display_name                
      if (order.card) {
        order.card = JSON.parse(order.card)
      }
      let status_ids = _.map(order.arts,"status")
      let statuses = await Status.getStatuses(status_ids)
      for (art of order.arts) {
        art.status = (_.find(statuses,{id:art.status})).display_name || null
      }
    } catch (err) {
      sails.log(`Error in Model Order_art function getOrder. ${err} `);
    }
    return order
  },
  getOrderArtsById: async function (order_art_ids, artist_id = null) {
    let data = []
    try {
      let where = `oa.id in (${order_art_ids.toString()})`
      if (artist_id) {
        where += ` AND oa.artist_id = '${artist_id}'`
      }
      let query = `
      select DISTINCT ON (oa.shippo_rate_id)
      oa.*
      from order_arts oa
      inner join order_addresses a
      on a.order_id = oa.order_id
      where ${where}
      `
      console.log(query)
      let result = await sails.sendNativeQuery(query)
      data = result.rows
    } catch (err) {
      sails.log(`Error in Model Order_art function getOrderArtsById. ${err} `);
    }
    return data
  }
};
