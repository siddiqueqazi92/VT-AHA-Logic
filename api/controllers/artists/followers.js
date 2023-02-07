module.exports = {
	friendlyName: "Get",

	description: "Get artist followers",

	inputs: {
		user: {
			type: "ref",
		},
		artist_id: {
			type: "string",
			required: false,
		},
		search_text: {
			type: "string",
		  },
		offset: {
			type: "number",
			defaultsTo: 0,
		},
		limit: {
			type: "number",
			defaultsTo: 1000,
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
			"Running artists/get.js with inputs " + JSON.stringify(inputs)
		);

		try {
			let artist_id = inputs.artist_id || inputs.user.id;
			let followers = await Artist_follower.find({
				where: { artist_id },
				select: ["follower_id"],
			});
			followers = _.map(followers, "follower_id");
			if (!followers.length) {
				return exits.ok({
					status: false,
					message: "Followers not found",
				});
			}
			
			let where = { is_active: true, user_id: followers };
			if (inputs.search_text) {        
				where.or = [{ username: { contains: inputs.search_text } },{ name: { contains: inputs.search_text } }];
			  }
			let select = [
				"user_id",
				"is_artist",
				"name",
				"username",
				"profile_image",
				"is_artist"
			];
			let followersList = await User.getUsers(
				where,
				select,
				inputs.user,
				inputs.offset,
				inputs.limit
      );
      let current_user = _.find(followersList, { id: inputs.user.id });
      if (current_user) {        
        followersList.splice(followersList.findIndex(x => x.id == current_user.id), 1);
        followersList.splice(0, 0, current_user);
      }
      sails.log({current_user})
			return exits.success({
				status: true,
				message: "Followers Listed Successfully",
				data: followersList,
			});
		} catch (err) {
			sails.log.error("error calling artists/followers.js", err.message);
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
