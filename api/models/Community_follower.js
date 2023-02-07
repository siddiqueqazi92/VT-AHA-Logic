/**
 * Community.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { SavingsPlans } = require("aws-sdk");

module.exports = {
	datastore: "default",
	tableName: "community_followers",
	primaryKey: "id",
	attributes: {
		createdAt: false,
		updatedAt: false,
		community: {
			model: "community",
			columnName: "community_id",
		},
		follower_id: {
			type: "string",
		},
	},
	addFollower: async function (follower_id, community_ids) {
		try {
			for (community of community_ids) {
				let obj = { community, follower_id };
				await Community_follower.updateOrCreate(obj, obj);
			}
			return true;
		} catch (err) {
			sails.log.error(
				`Error in Model: Community_follower,Function: addFollower. ${err}`
			);
			return false;
		}
	},
	getFollowerIds: async function (community_id = null) {
		let follower_ids = [];
    try {
      let where = { follower_id: { "!=": null } }
      if (community_id) {
        where.community = community_id
      }
			let followers = await Community_follower.find({
				where: where,
				select: ["follower_id"],
			});

			if (followers.length) {
				follower_ids = _.map(followers, "follower_id");
			}
		} catch (err) {
			sails.log.error(
				`Error in Model: Community_follower,Function: getFollowerIds. ${err}`
			);
		}
		return follower_ids;
	},
	getCommunityFollowers: async function (community_ids = [], follower_ids = []) {
		let data = [];
    try {
		let where = { follower_id: { "!=": null } }
		if (follower_ids.length) {
			where.follower_id = follower_ids
		}
      if (community_ids.length) {
        where.community = community_ids
      }
			data = await Community_follower.find({
				where: where,
				select: ["community","follower_id"],
			});
		} catch (err) {
			sails.log.error(
				`Error in Model: Community_follower,Function: getCommunityFollowers. ${err}`
			);
		}
		return data;
	},
};
