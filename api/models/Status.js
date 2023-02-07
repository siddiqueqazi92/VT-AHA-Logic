/**
 * Status.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
tableName:"statuses",
  attributes: {
    createdAt:false,
    updatedAt:false,
    slug: {
      type:'string'
    },
    display_name: {
      type:'string'
    }
    

  },
  getStatuses: async function (ids) {
		let data = {};
    try {
      
		  data = await Status.find({
        where:{id:ids},
        select: ["id", "slug", "display_name"],
      })                  
		} catch (err) {
			sails.log(`Error in Model Status function getStatus. ${err} `);
		}
		
		return data;
	},

};

