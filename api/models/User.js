/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "users",
	attributes: {
		user_id: {
			type: "string",
			required: true,
			columnName: "user_id",
		},
		country_code: {
			type: "string",
			required: false,
			allowNull: true,
		},
		contact: {
			type: "string",
			required: false,
			allowNull: true,
		},
		email: {
			type: "string",
			required: false,
			allowNull: true,
			isEmail: true,
		},
		is_active: {
			type: "boolean",
			defaultsTo: true,
		},
		name: {
			type: "string",
			required: false,
			allowNull: true,
		},
		username: {
			type: "string",
			required: false,
			allowNull: true,
		},
		bio: {
			type: "string",
			required: false,
		},
		profile_image: {
			type: "string",
			required: false,
			defaultsTo:"https://ahauserposts.s3.amazonaws.com/image_2021_11_25T18_57_06_110Z.png",
		},
		is_artist: {
			type: "boolean",
			required: false,
			defaultsTo: false,
		},
		cover_image: {
			type: "string",
			required: false,
			defaultsTo:"https://ahauserposts.s3.amazonaws.com/image_2021_11_25T18_57_06_110Z.png",
		},
		facebook: {
			type: "string",
			required: false,
		},
		instagram: {
			type: "string",
			required: false,
		},
		tiktok: {
			type: "string",
			required: false,
		},
		dribble: {
			type: "string",
			required: false,
		},
		country: {
			type: "string",
			required: false,
			defaultsTo:"United States of America"
		},
		wallet: {
			type: "number",
			required: false,
			defaultsTo: 0,
		},
		customer_id: {
			type: "string",
			required: false,
			allowNull: true,
		},
		device_token: {
			type: "string",
			required: false,
			allowNull: true,
		},
		stripe_account_id: {
			type: "string",
			required: false,
			allowNull: true,
		},
		pending_amount: {
			type: "number",
			required: false,
			defaultsTo:0
		},
		available_amount: {
			type: "number",
			required: false,
			defaultsTo:0
		},
		total_amount: {
			type: "number",
			required: false,
			defaultsTo:0
		},
		withdrawal_requested: {
			type: "boolean",
			required: false,
			defaultsTo:false
		},
		login_type: {
			type: "string",
			required: false,
			defaultsTo:'simple'
		},
		login_attempts: {
			type: "number",
			required: false,
			defaultsTo: 2
		},
		role: {
			type: "string",
			required: false,
			defaultsTo: global.ROLE.USER
		},
	},
	customToJSON: function () {
		if (this.wallet) {
			this.wallet = parseFloat(this.wallet);
		}
		if (this.available_amount) {
			this.available_amount = parseFloat(this.available_amount);
		}
		if (this.pending_amount) {
			this.pending_amount = parseFloat(this.pending_amount);
		}
		if (this.total_amount) {
			this.total_amount = parseFloat(this.total_amount);
		}
		if (this.contact) {
			this.contact = this.country_code + this.contact;
		}
		delete this.country_code;
		return _.omit(this, ["createdAt", "updatedAt"]);
	},
	getArtists: async function (where, select, user, offset = 0, limit = 1000) {
		let artists = await User.find({
			where,
			select,
		})
			.skip(offset)
			.limit(limit)
			.sort("createdAt DESC");
		if (artists.length) {
			let following = await Artist_follower.find({
				where: { follower_id: user.id },
				select: ["artist_id"],
			});
			following = _.map(following, "artist_id");

			for (artist of artists) {
				artist.id = artist.user_id;

				artist.profile_name = artist.name;
				artist.profile_tag_id = artist.username;
				artist.image = artist.profile_image;
				artist.is_following = following.includes(artist.id);

				delete artist.user_id;
				delete artist.username;
				delete artist.name;
				delete artist.profile_image;
			}
		}
		return artists;
	},
	
	getUsers: async function (where, select, user, offset = 0, limit = 1000) {
		let users = await User.find({
			where,
			select,
		})
			.skip(offset)
			.limit(limit);
		if (users.length) {
			let following = await Artist_follower.find({
				where: { follower_id: user.id },
				select: ["artist_id"],
			});
			following = _.map(following, "artist_id");

			for (user of users) {
				user.id = user.user_id;

				user.profile_name = user.name;
				user.profile_tag_id = user.username;
				user.image = user.profile_image;
				user.is_following = following.includes(user.id);

				delete user.user_id;
				delete user.username;
				delete user.name;
				delete user.profile_image;
			}
		}
		return users;
	},
	makeArtist: async function (inputs) {
		let done = false;
		try {
			done = await sails.getDatastore().transaction(async (db) => {
				let obj = {
					cover_image: inputs.cover_image,
					is_artist: true,
					user_id: inputs.user.id,
				};
				await User.updateOrCreate({ user_id: inputs.user.id }, obj); //.usingConnection(db);
				let user = await User.findOne({
					where: { user_id: inputs.user.id },
					select: ["username", "profile_image"],
				});
				let community_name = await sails.helpers.getCommunityName(
					inputs.user.id,
					user.username + "'s Community"
				);

				await Community.createOrUpdateCommunity(
					inputs.user.id,
					community_name,
					inputs.profile_image || inputs.user.profile_image || null
				);
				// if (!updated) {
				//   throw new Error(
				//     "Consistency violation: Database is corrupted-- logged in user record has gone missing"
				//   );
				// }
				inputs.address.user_id = inputs.user.id;
				updated = await Artist_address.updateOrCreate(
					{ user_id: inputs.user.id },
					inputs.address
				); //.usingConnection(db);

				if (inputs.vibes) {
					await User_vibe.destroy({ user_id: inputs.user.id });
					for (vibe of inputs.vibes) {
						await User_vibe.create({ vibe: vibe, user_id: inputs.user.id });
					}
				}
				if (inputs.interests) {
					await User_interest.destroy({ user_id: inputs.user.id });
					for (interest of inputs.interests) {
						await User_interest.create({
							interest: interest,
							user_id: inputs.user.id,
						});
					}
				}
				// if (inputs.communities) {
				//   await Community_follower.destroy({ follower_id: inputs.user.id });
				//   for (community of inputs.communities) {
				//     await Community_follower.create({
				//       community: community,
				//       follower_id: inputs.user.id,
				//     });
				//   }
				// }
				Promise.resolve(true);

				// if (!updated) {
				//   throw new Error("There is no recipient with that id");
				// }
			});
		} catch (err) {
			sails.log.error(`Error in model User,function becomeArtist. ${err}`);
		}
		return done;
	},
	getProfile: async function (user_id) {
		let data = null;
		try {
			data = await User.findOne({
				where: { user_id },
				select: [
					"name",
					"username",
					"bio",
					"profile_image",
					"is_artist",
					"cover_image",
					"facebook",
					"instagram",
					"tiktok",
					"dribble",
					"wallet",
					"login_type",
					"login_attempts"
				],
			});
		} catch (err) {}
		return data;
	},
	getAhaArtist: async function () {
		let data = null;
		try {
			data = await User.findOne({
				where: { username: global.AHA_ARTIST.username },
				select: [
					"user_id",
					"username",
					"name",
					// "bio",
					"profile_image",
					// "is_artist",
					// "cover_image",
					// "facebook",
					// "instagram",
					// "tiktok",
					// "dribble",
					// "wallet"
				],
			});
		} catch (err) {
			sails.log.error(`Error in model User, function getAhaArtist. ${err}`);
		}
		return data;
	},
	getArtistAddress: async function (user_id) {
		let data = null;
		try {
			data = await Artist_address.find({
				where: { user_id },
				select: ["country", "state", "city"],
			});
			if (data.length) {
				data = data[0];
				delete data.id;
			} else {
				data = {}
			}
		} catch (err) {
			sails.log.error(`Error in model User, function getArtistAddress. ${err}`);
		}
		return data;
	},
	getSuggestedArtists: async function (user, offset, limit) {
		let data = [];
		try {
			let user_vibes = await User_vibe.getUserVibeIds(user.user_id);
			let user_interests = await User_interest.getUserInterestIds(user.user_id);
			let following = await User.getFollowingArtistIds(user.user_id); // which are followed by logged in user
			let top_following = await User.getTopFollowingArtistsIds(
				user.user_id,
				following
			); // who have most number of followers
			let artists_of_latest_art = await User.getLatestArtsArtistsIds(
				user.user_id,
				following
			); // which are followed by logged in user
			let query = await User.getSuggestedArtistsQuery(
				user,
				user_vibes,
				user_interests,
				following,
				top_following,
				artists_of_latest_art,
				offset,
				limit
			);
			// sails.log(query);
			let result = await sails.sendNativeQuery(query);
			data = result.rows;
			if (!data.length || data.length < limit) {
				query = await User.getSuggestedArtistsQueryRandom(
					user,
					following,
					limit - data.length,
					_.map(data, "id")
				);
				sails.log(query);
				result = await sails.sendNativeQuery(query);
				if (result.rows.length) {
					data = _.union(data, result.rows);
				}
			}
		} catch (err) {
			sails.log.error(
				`Error in model User, function getSuggestedArtists. ${err}`
			);
		}
		return data;
	},
	getTopFollowingArtistsIds: async function (user_id, exclude = []) {
		let data = [];
		// let query = `
		// SELECT distinct artist_id
		// FROM artist_followers a
		// WHERE 10 <
		//     (SELECT COUNT(*)
		//      FROM artist_followers
		//      WHERE artist_id=a.artist_id);`
		exclude.push(user_id);
		exclude = "'" + exclude.join("','") + "'";
		let query = `
    SELECT distinct artist_id ,(SELECT COUNT(*) 
    FROM artist_followers 
    WHERE artist_id=a.artist_id) AS number_of_followers
    FROM artist_followers a 
    
    ORDER BY number_of_followers DESC LIMIT 10`;
		sails.log(query);
		try {
			let result = await sails.sendNativeQuery(query);
			data = result.rows;
			if (data.length) {
				data = _.map(data, "artist_id");
			}
		} catch (err) {
			sails.log.error(
				`Error in model User, function getTopFollowingArtistsIds. ${err}`
			);
		}
		return data;
	},
	getLatestArtsArtistsIds: async function (user_id, exclude = []) {
		let data = [];
		exclude.push(user_id);
		try {
			data = await Art.find({
				where: { artist_id: { "!=": exclude }, deletedAt: null },
				select: ["artist_id"],
			})
				.sort("createdAt DESC")
				.limit(10);
			if (data.length) {
				data = _.map(data, "artist_id");
			}
		} catch (err) {
			sails.log.error(
				`Error in model User, function getLatestArtsArtistsIds. ${err}`
			);
		}
		return data;
	},
	getSuggestedArtistsQuery: async function (
		user,
		vibes,
		interests,
		following,
		top_following,
		artists_of_latest_art,
		offset = 0,
		limit = 10
	) {
		following.push(user.user_id);
		following = "'" + following.join("','") + "'";

		let query = `
    SELECT DISTINCT u.user_id AS id,u.profile_image AS image,u.cover_image,u.username AS profile_tag_id,u.name AS profile_name,u.bio,u."createdAt",false AS is_following 
    FROM users u
    LEFT JOIN user_vibes uv
    ON uv.user_id = u.user_id
    LEFT JOIN user_interests ui
    ON ui.user_id = u.user_id
    WHERE u.is_artist = true    
    AND u.country = '${user.country}'   
    AND u.user_id NOT IN (${following})
    `;
		if (top_following.length) {
			top_following = "'" + top_following.join("','") + "'";
			query += ` AND u.user_id IN (${top_following})`;
		}
		// if (artists_of_latest_art.length) {
		// 	artists_of_latest_art = "'" + artists_of_latest_art.join("','") + "'";
		// 	query += ` AND u.user_id IN (${artists_of_latest_art})`;
		// }
		if (vibes.length) {
			query += ` AND uv.vibe_id IN (${vibes.toString()})`;
		}
		if (interests.length) {
			query += ` AND ui.interest_id IN (${interests.toString()})`;
		}
		query += ` ORDER BY u."createdAt" DESC OFFSET ${offset} LIMIT ${limit}`;
		return query;
	},
	getSuggestedArtistsQueryRandom: async function (
		user,
		following,
		limit = 10,
		exclude = []
	) {
		following.push(user.user_id);
		if (exclude.length) {
			following = _.merge(following, exclude);
		}
		following = "'" + following.join("','") + "'";
		let query = `
    SELECT DISTINCT u.user_id AS id,u.profile_image AS image,u.cover_image,u.username AS profile_tag_id,u.name AS profile_name,u.bio,u."createdAt",false AS is_following 
    FROM users u
    LEFT JOIN user_vibes uv
    ON uv.user_id = u.user_id
    LEFT JOIN user_interests ui
    ON ui.user_id = u.user_id
    WHERE u.is_artist = true        
    AND u.user_id NOT IN (${following})
    `;

		query += ` ORDER BY u."createdAt" DESC OFFSET RANDOM() LIMIT ${limit}`;
		return query;
	},
	getFollowingArtistIds: async function (user_id) {
		let data = [];
		try {
			let following = await Artist_follower.find({
				where: { follower_id: user_id },
				select: ["artist_id"],
			});
			if (following.length) {
				data = _.map(following, "artist_id");
			}
		} catch (err) {
			sails.log.error(
				`Error in model User, function getFollowingArtistIds. ${err}`
			);
		}
		return data;
	},
	getArtistsBySearchText: async function (search_text, fetch = "ids") {
		let data = [];
		try {
			let where = { is_artist: true };
			where.or = [
				{ username: { contains: search_text } },
				{ name: { contains: search_text } },
			];

			let artists = await User.find({ where, select: ["user_id"] });
			if (artists.length) {
				switch (fetch) {
					case "ids":
						data = _.map(artists, "user_id");
						break;
					case "rows":
						data = artists;
						break;
				}
			}
		} catch (err) {
			sails.log.error(
				`Error in model User, function getArtistsBySearchText. ${err}`
			);
		}
		return data;
	},
	getUserIds: async function (search_text) {
		let data = [];
		try {	
			let query = `
			select user_id,username
			from users
			where username like '%${search_text}%'
			`
			let result = await sails.sendNativeQuery(query)
			if (result.rows.length) {
				data = _.map(result.rows,"user_id")
			}
		} catch (err) {
			sails.log.error(
				`Error in model User, function getUserIds. ${err}`
			);
		}
		return data;
	},
	getFollowingCounts: async function (artist_ids = []) {		
		let data = []
		try {
		let where = `follower_id is not NULL`
		if (artist_ids.length) {
			artist_ids = "'" + artist_ids.join("', '") + "'";
			where += ` AND follower_id IN (${artist_ids.toString()})`
		}
		let query = `
		SELECT COUNT(*) AS total,follower_id
		FROM artist_followers		
		WHERE ${where}
		GROUP BY follower_id`;
		sails.log(query)
		let result = await sails.sendNativeQuery(query);
		data = result.rows
		} catch (err) {
			sails.log(`Error in Model User, function getFollowingCounts. ${err} `);
		}
		
		return data;
	},
	getFollowerCounts: async function (user_id = []) {		
		let data = []
		try {
		let where = `artist_id is not NULL`
		if (user_id.length) {
			user_id = "'" + user_id.join("', '") + "'";
			where += ` AND artist_id IN (${user_id.toString()})`
		}
		let query = `
		SELECT COUNT(*) AS total,artist_id
		FROM artist_followers		
		WHERE ${where}
		GROUP BY artist_id`;
		sails.log(query)
		let result = await sails.sendNativeQuery(query);
		data = result.rows
		} catch (err) {
			sails.log(`Error in Model User, function getFollowingCounts. ${err} `);
		}
		
		return data;
	},
};
