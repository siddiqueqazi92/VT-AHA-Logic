/**
 * User_vibe.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "art_vibes",
  primaryKey: "id",
  attributes: {
    createdAt: false,
    updatedAt: false,

    art: {
      model: "art",
      required: true,
      columnName: "art_id",
    },
    vibe: {
      model: "vibe",
      required: true,
      columnName: "vibe_id",
    },
  },
  getAllArtsVibes: async function (art_ids) {		
		let data = []
		try {
      let art_vibes = await Art_vibe.find({ art: art_ids }).populate('vibe');
      if (art_vibes.length) {
        // data = _.map(art_vibes, "vibe");
        data = art_vibes      
      }		
		} catch (err) {
			sails.log(`Error in Model Art_vibe, function getAllArtsVibes. ${err} `);
		}
		
		return data;
	},
  getArtVibes: async function (art_vibes,art_id) {		
		let data = []
		try {     
      if (art_vibes.length) {
        // data = _.map(art_vibes, "vibe");
        data = art_vibes
        data =  _.filter(data, function (o) {
          return o.art == art_id;
        });
        data = _.map(data,"vibe")
      }		
		} catch (err) {
			sails.log(`Error in Model Art_vibe, function getArtVibes. ${err} `);
		}
		
		return data;
	},
  getVibesContainArts: async function (artist_ids  = null) {	
		let data = []
    try { 
      let where = `v.id is not null`
      if (artist_ids !== null && Array.isArray(artist_ids)) {
        let artist_id = "'" + artist_ids.join("', '") + "'";
        where += ` AND a.artist_id in (${artist_id})`
      }
      let query = `
      select distinct uv.vibe_id
      from vibes v
      inner join art_vibes av
      on av.vibe_id = v.id    
      inner join arts a
      on a.id = av.art_id
      inner join user_vibes uv
      on uv.user_id = a.artist_id
      where ${where}  
      `
      sails.log(query)
      let result = await sails.sendNativeQuery(query);
      if (result.rows.length) {
        // data = _.map(art_vibes, "vibe");      
        data = _.map(result.rows,"vibe_id")
      }		
		} catch (err) {
			sails.log(`Error in Model Art_vibe, function getVibesContainArts. ${err} `);
		}
		
		return data;
	},
};
