async function getAll(inputs, artist_ids) {
	let data = {total_count:0};
	let where = {};
	where.deletedAt = null;
	where.type = global.ART_TYPE.DEFAULT;
	where.title = { contains: inputs.search_text };
	where.and = [{ artist_id: { "!=": inputs.user.id } }];
	if (inputs.city || inputs.state || inputs.country) {
		where.and.push({ artist_id: artist_ids });
	}
	let exclude_ids = await Artist_collection.getCollectionArtIds(
		null,
		(get = "private")
	);
	if (exclude_ids.length) {
		where.id = { "!=": exclude_ids };
	}
	data.arts = await Art.searchArts(where, inputs.offset, inputs.limit);
	data.total_count += await Art.count(where);

	where = {};
	where.or = [{ name: { contains: inputs.search_text } }];
	where.or.push({ username: { contains: inputs.search_text } });
	where.and = [{ user_id: { "!=": inputs.user.id } }, { is_artist: true }];
	if (inputs.city || inputs.state || inputs.country) {
		where.and.push({ user_id: artist_ids });
	}
	let select = ["user_id", "name", "username", "profile_image"];
	data.artists = await User.getArtists(
		where,
		select,
		inputs.user,
		inputs.offset,
		inputs.limit
	);
	data.total_count += await User.count(where)

	where = {};
	where.or = [{ title: { contains: inputs.search_text } }];
	if (inputs.city || inputs.state || inputs.country) {
		where.id = await Art_vibe.getVibesContainArts(artist_ids);
	} else {
		where.id = await Art_vibe.getVibesContainArts(null);
	}
	data.vibes = await Vibe.getVibes(where, inputs.offset, inputs.limit);
	data.total_count += await Vibe.count(where);

	where = { is_public: true };
	where.or = [{ title: { contains: inputs.search_text } }];
	where.and = [{ user_id: { "!=": inputs.user.id } }];
	if (inputs.city || inputs.state || inputs.country) {
		where.and.push({ user_id: artist_ids });
	}
	data.art_collections = await Artist_collection.getArtistCollections(
		where,
		inputs.user,
		inputs.offset,
		inputs.limit
	);
	data.total_count += await Artist_collection.count(where);
	return data;
}
async function getArts(inputs, artist_ids) {
	let where = {};
	where.deletedAt = null;
	where.type = global.ART_TYPE.DEFAULT;
	if (inputs.search_text) {
		where.title = { contains: inputs.search_text };
	}

	where.and = [{ artist_id: { "!=": inputs.user.id } }];
	if (inputs.city || inputs.state || inputs.country) {
		where.and.push({ artist_id: artist_ids });
	}

	let exclude_ids = await Artist_collection.getCollectionArtIds(
		null,
		"private"
	);
	exclude_ids = exclude_ids.filter(Number);
	if (exclude_ids.length) {
		where.id = { "!=": exclude_ids };
	}
	let data = {arts:[],total_count:0}
	data.arts = await Art.searchArts(where, inputs.offset, inputs.limit);
	data.total_count = await Art.count(where);
	return data
}
async function getArtistIdsByLocation(inputs) {
	let artist_ids = [];
	let where = {};
	if (inputs.city) {
		where.city = { contains: inputs.city };
	}
	if (inputs.state) {
		where.state = { contains: inputs.state };
	}
	if (inputs.country) {
		where.country = { contains: inputs.country };
	}
	let artist_addresses = await Artist_address.find({
		where,
		select: ["user_id"],
	});
	if (artist_addresses.length) {
		artist_ids = _.map(artist_addresses, "user_id");
	}
	const index = artist_ids.indexOf(inputs.user.id);
	if (index > -1) {
		artist_ids.splice(index, 1); // 2nd parameter means remove one item only
	}

	return artist_ids;
}
module.exports = {
	friendlyName: "Items",

	description: "Search items",

	inputs: {
		user: {
			type: "ref",
		},
		search_text: {
			type: "string",
			defaultsTo: "",
		},
		search_category: {
			type: "string",			
		},
		city: {
			type: "string",
		},
		state: {
			type: "string",
		},
		country: {
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
			"Running user/search/items.js with inputs " + JSON.stringify(inputs)
		);
		if (!inputs.search_category && _.isEmpty(inputs.search_text)) {
			return exits.success({
				status: true,
				message: "Items not found",
				data:{total_count:0,art_collections:[],arts:[],artists:[],vibes:[]}
			})
		}
		let data = {total_count:0};
		
		try {
			let where = {};
			let artist_ids = [];
			if (inputs.city || inputs.state || inputs.country) {
				artist_ids = await getArtistIdsByLocation(inputs);
			}

			switch (inputs.search_category) {
				case "arts":
					arts_data = await getArts(inputs, artist_ids);
					data.arts = arts_data.arts
					data.total_count = arts_data.total_count
					break;
				case "artists":
					where.or = [{ name: { contains: inputs.search_text } }];
					where.or.push({ username: { contains: inputs.search_text } });
					where.and = [
						{ user_id: { "!=": inputs.user.id } },
						{ is_artist: true },
					];
					if (inputs.city || inputs.state || inputs.country) {
						where.and.push({ user_id: artist_ids });
					}

					let select = ["user_id", "name", "username", "profile_image"];
					data.artists = await User.getArtists(
						where,
						select,
						inputs.user,
						inputs.offset,
						inputs.limit
					);
					data.total_count = await User.count({
						where,
					})		
					break;
				case "vibes":
					if (inputs.search_text) {
						where.or = [{ title: { contains: inputs.search_text } }];
					}
					if (inputs.city || inputs.state || inputs.country) {
						where.id = await Art_vibe.getVibesContainArts(artist_ids);
					} else {
						where.id = await Art_vibe.getVibesContainArts(null);
					}
					let filter_obj = { ...inputs };
					filter_obj.offset = 0;
					filter_obj.limit = 1000;

					data.vibes = await Vibe.getVibes(where, inputs.offset, inputs.limit);
					data.total_count = await Vibe.count(where);					

					break;
				case "art_collections":
					where.is_public = true;
					where.or = [{ title: { contains: inputs.search_text } }];

					where.and = [{ user_id: { "!=": inputs.user.id } }];
					if (inputs.city || inputs.state || inputs.country) {
						where.and.push({ user_id: artist_ids });
					}

					data.art_collections = await Artist_collection.getArtistCollections(
						where,
						inputs.user,
						inputs.offset,
						inputs.limit
					);
					data.total_count =  collections = await Artist_collection.count(where)
					break;
				case "all":
					data = await getAll(inputs, artist_ids);
					break;
			}
			if (_.isEmpty(data)) {
				return exits.ok({
					status: false,
					message: "Items not found",
					data,
				});
			}
			return exits.success({
				status: true,
				message: "Items Listed Successfully",
				data,
			});
		} catch (err) {
			sails.log.error("error calling user/search/items.js", err.message);
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
