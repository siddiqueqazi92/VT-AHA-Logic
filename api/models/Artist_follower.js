/**
 * Artist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "artist_followers",
  primaryKey: "id",
  attributes: {
    createdAt: false,
    updatedAt: false,

    artist_id: {
      type: "string",
    },
    follower_id: {
      type: "string",
    },
  },
  getFollowingIds: async function (follower_id = null) {
		let following_ids = [];
    try {
      let where = { follower_id: { "!=": null } }
      if (follower_id) {
        where.follower_id = follower_id
      }
			let following = await Artist_follower.find({
				where: where,
				select: ["artist_id"],
			});

			if (following.length) {
				following_ids = _.map(following, "artist_id");
			}
		} catch (err) {
			sails.log.error(
				`Error in Model: Artist_follower,Function: getFollowingIds. ${err}`
			);
		}
		return following_ids;
  },
  getFollowerIds: async function (following_id = null) {
    let follower_ids = [];
      try {
        let where = { artist_id: { "!=": null } }
        if (following_id) {
          where.artist_id = following_id
        }
          let followers = await Artist_follower.find({
              where: where,
              select: ["follower_id"],
          });

          if (followers.length) {
              follower_ids = _.map(followers, "follower_id");
          }
      } catch (err) {
          sails.log.error(
              `Error in Model: Artist_follower,Function: getFollowerIds. ${err}`
          );
      }
      return follower_ids;
  },
};
