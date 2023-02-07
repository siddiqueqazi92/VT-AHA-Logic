/**
 * Vibe.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "vibes",
  primaryKey: "id",
  attributes: {
    title: {
      type: "string",
      required: true,
    },
    image: {
      type: "string",
      required: false,
      allowNull: true,
    },
  },
  getVibes: async function (where, offset = 0, limit = 1000) {		
		let vibes = [];

		try {
      vibes = await Vibe.find({ where, select: ["id", "title", "image"] })
      .skip(offset)
        .limit(limit)
        .sort("createdAt DESC");
			
			
		} catch (err) {
			sails.log.error(`Error in model Vibe, function getVibes. ${err}`);
		}
		return vibes;
	},

};
