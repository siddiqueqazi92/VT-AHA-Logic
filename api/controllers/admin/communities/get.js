module.exports = {
	friendlyName: "Get communities",

	description: "Get all communities.",

	inputs: {
		// admin: {
		//   type: 'ref',
		//   required: true,
		//   description: 'logged in admin'
		// },
		query: {
			type: "ref",
		},
	},

	exits: {
		invalid: {
			responseType: "badRequest",
		},
		unauthorized: {
			responseType: "unauthorized",
		},
		forbidden: {
			responseType: "forbidden",
		},
		serverError: {
			responseType: "serverError",
		},
		ok: {
			responseType: "ok",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug(
			"Running admin/communities/get.js with inputs " + JSON.stringify(inputs)
		);
		try {
			let query = null;
			if (inputs.query) {
				query = JSON.parse(inputs.query);
			} else {
				query = this.req.query;
			}

			sails.log({ reqQuery: JSON.stringify(query) });
			let range = [0, 9];
			if (query.range) {
				range = JSON.parse(query.range);
			}

			var sort = await sails.helpers.getSortFilters(query, true);

			let where = { id: { "!=": null } };
			if (query.filter) {
				var filter = JSON.parse(query.filter);

				if (filter.q) {
					filter.q = filter.q.toLowerCase();
					where.or = [{ name: { contains: filter.q } }];
					if (parseInt(filter.q)) {
						where.or.push({ id: parseInt(filter.q) });
					}
				}
				if (filter.id) {
					where.id = filter.id;
				}
				if (filter.follower_id) {
					ids = []
					community_follower_data = await Community_follower.find({
						where: { follower_id: filter.follower_id },
						select: ["community"],
					});
					if (community_follower_data.length) {
						ids = _.map(community_follower_data,"community")
					}
					where.id = ids
				}
			}
			//let aha_community = await Community.getAhaCommunity();
			// if (range[0] == 0) {
			//   where.id = { contains: aha_community.id };
			// }
			// let order = sort[0];
			// order = Object.keys(order).map((key) => [key, order[key]])[0];
			// sails.log({ oder: order });

			sails.log({ sortaaaaa: sort });
			let communities = await Community.find({
				where: where,
				select: ["id", "name", "image", "artist_id", "createdAt"],
			})
				.skip(range[0])
				.limit(range[1] - range[0] + 1)
				.sort(sort);
			if (communities.length) {
				let artists = await User.find({
					where: { user_id: _.map(communities, "artist_id") },
					select: ["user_id", "username", "name"],
				});
				let total = await Community.count({ where: where });
				communities[0].total = total
				for (c of communities) {
					c.artist = _.find(artists, { user_id: c.artist_id });
				}
				let aha_community = await Community.getAhaCommunity();
				_.remove(communities, {
					id: aha_community.id,
				});
				if (range[0] == 0) {
					let aha_artist = await User.getAhaArtist();
					aha_community.artist = aha_artist;
					aha_community.total = total
					communities = communities.filter(
						(item) => item.id !== aha_community.id
					);

					communities.unshift(aha_community);		
					// if (filter && ac_exist) {
					// 	communities.unshift(aha_community);	
					// } else if(!filter) {
					// 	communities.unshift(aha_community);	
					// }
				}
				if (!_.isUndefined(communities[10])) {
					communities.pop();
				}
				_.isUndefined(filter.follower_id)? communities:communities.reverse(),
				communities[0].total = total > 1 ? total - 1 : total;
				let community_ids = _.map(communities,"id")
				let follower_counts = await Community.getFollowerCounts(community_ids)
				for (c of communities) {
					c.follower_count = _.find(follower_counts, { community_id: c.id });
					c.follower_count = c.follower_count ? parseInt(c.follower_count.total) : 0
				}
				
				return exits.success({
					status: true,
					message: `${communities.length} records found`,
					data: communities
				});
			}
			return exits.ok({
				status: false,
				message: "",
				data: [],
			});
		} catch (err) {
			sails.log.error("error calling admin/communities/get.js", err.message);
			if (
				!_.isUndefined(err.response) &&
				!_.isUndefined(err.response.data) &&
				!_.isUndefined(err.response.status)
			) {
				let [exitsName, responseData] = await sails.helpers.response.with({
					status: err.response.status,
					data: err.response.data,
				});
				return exits[exitsName](responseData);
			}
			return exits.serverError({
				status: false,
				data: [],
				message: "Unknown server error.",
			});
		}
	},
};
