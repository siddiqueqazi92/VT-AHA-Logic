/**
 * User_address.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "user_addresses",
  attributes: {
    createdAt: false,
    updatedAt: false,
    user_id: {
      type: "string",
      required: true,
      columnName: "user_id",
    },
    is_selected: {
      type: "boolean",
      defaultsTo: false,
    },
    title: {
      type: "string",
      required: true,
    },
    country: {
      type: "string",
      required: true,
    },
    city: {
      type: "string",
      required: true,
    },
    state: {
      type: "string",
      required: true,
    },
    street: {
      type: "string",
      required: true,
    },
    zip: {
      type: "string",
      required: true,
    },  
    is_picking_point: {
      type: "boolean",
      defaultsTo: false,
    },
  
  },
  countAddresses: async function (user_id) {		
		let data	 = 0;

		try {
			data = await User_address.count({
				user_id,			
			})			
		} catch (err) {
			sails.log.error(`Error in model User_address, function countAddresses. ${err}`);
		}
		return data;
	},
  getArtistsPickingPointByArtIds: async function (art_ids) {		
		let data	 = [];
    
    try {
      if (art_ids.length) {
        let query = `
        select ua.title as name,country,state,street,city,zip,a.artist_id,a.id as art_id
        from user_addresses ua
        inner join arts a
        on a.artist_id = ua.user_id
        where a.id in (${art_ids.toString()})
        and ua.is_selected = true
        `	
        data = (await sails.sendNativeQuery(query)).rows 
      }     
		} catch (err) {
			sails.log.error(`Error in model User_address, function getArtistsPickingPointByArtIds. ${err}`);
		}
		return data;
	},
};
