/**
 * User_pinned_art.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "user_pinned_arts",
	attributes: {
		createdAt: false,
		updatedAt: false,
		user_id: {
			type: "string",
			required: true,
		},
		art: {
			model: "art",
			columnName: "art_id",
		},
		collection: {
			model: "user_collection",
			columnName: "collection_id",
		},
		artist_collection: {
			model: "artist_collection",
			columnName: "artist_collection_id",
		},
		is_public: {
			type: "boolean",
			required: false,
			defaultsTo:false
		  },
	},
	getPinnedItemIds: async function (where, offset = 0, limit = 1000, sort = "id DESC", select = []) {		
		let pinned = {art_ids:[],artist_collection_ids:[]};
		try {
			let find = { where };
		if (select.length) {
			find.select = select;
		}
		 pinned_arts = await User_pinned_art.find(find).skip(offset).limit(limit).sort(sort);
		if (pinned_arts.length) {
			pinned.art_ids = _.compact(_.map(pinned_arts, "art"))
			pinned.artist_collection_ids = _.compact(_.map(pinned_arts, "artist_collection"))		
			pinned.pinned_arts = pinned_arts
			pinned.all_ids = []
			for (p of pinned_arts) {
				pinned.all_ids.push(p.artist_collection || p.art)
			}
		}
		} catch (err) {
			sails.log(`Error in Model User_pinned_art, function getPinnedItemIds. ${err} `);
		}
		
		return pinned;
	},
	getPinnedCounts: async function (ids = [],count_by = 'art_id') {		
		let data = []
		try {
		let where = `${count_by} is not NULL`
		if (ids.length) {
			where += ` AND ${count_by} IN (${ids.toString()})`
		}
		let query = `
		SELECT COUNT(*) AS total,${count_by}
		FROM user_pinned_arts
		WHERE ${where}
		GROUP BY ${count_by}`;
			let result = await sails.sendNativeQuery(query);
		data = result.rows
		} catch (err) {
			sails.log(`Error in Model User_pinned_art, function getPinnedCounts. ${err} `);
		}
		
		return data;
	},
};
