/**
 * Community_art.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  datastore: "default",
  tableName: "community_arts",
  primaryKey: "id",
  attributes: {
    createdAt:false,
    updatedAt:false,
    community: {
      model: "community",
      required: true,
      columnName:'community_id'
    },
    art: {
      model: "art",
      required: true,
      columnName:'art_id'
    },
  },
  createOrUpdateCommunityArt: async function (community, art) {

    let obj = { community, art }
    try {
      await Community_art.updateOrCreate(obj, obj);
      return true
    } catch (err) {
      sails.log.error(`Error in model Community_art, function createOrUpdateCommunityArt. ${err}`)
      return false
    }
  },
  getArtIds: async function (community_id = null) {
		let art_ids = [];
    try {
      let where = { art: { "!=": null } }
      if (community_id) {
        where.community = community_id
      }
			let arts = await Community_art.find({
				where: where,
				select: ["art"],
			});

			if (arts.length) {
				art_ids = _.map(arts, "art");
			}
		} catch (err) {
			sails.log.error(
				`Error in Model: Community_art,Function: getartIds. ${err}`
			);
		}
		return art_ids;
  },
  RemoveArtFromCommunity: async function (art) {

    try {
      await Community_art.destroy({ where: { art }});
      return true
    } catch (err) {
      sails.log.error(`Error in model Community_art, function RemoveArtFromCommunity. ${err}`)
      return false
    }
  },
   

};

