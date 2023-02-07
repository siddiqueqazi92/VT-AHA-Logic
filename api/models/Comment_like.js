/**
 * Comment_like.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "comment_likes",
  attributes: {
    createdAt: false,
    updatedAt:false,
		user_id: {
			type: "string",
			required: true,
		},
		comment: {
      model: "comment",
      columnName:"comment_id"
		},
	},
	getLikesCount: async function (
		comment_ids = []
	) {
		let data = [];
		try {
			let where = ` id IS NOT NULL`
			if (comment_ids.length) {
				where += ` AND comment_id IN (${comment_ids.toString()})`
 			}
			let query = `
			SELECT comment_id ,COUNT(*) AS likes
			FROM comment_likes
			where ${where}
			GROUP BY comment_id
			
			`
			let result = await sails.sendNativeQuery(query);
			data = result.rows
		} catch (err) {
			sails.log(`Error in Model Comment_like, function getLikesCount. ${err} `);
		}
		return data;
	},
};


