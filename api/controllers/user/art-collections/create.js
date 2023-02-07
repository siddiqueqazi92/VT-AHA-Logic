module.exports = {
	friendlyName: "Create art collection",

	description: "",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		title: {
			type: "string",
			required: true,
		},
		image: {
			type: "string",
			required: true,
		},
		vibes: {
			type: "ref",
			required: true,
		},
		is_public: {
			type: "boolean",
			required: true,
		},
	},

	exits: {
		invalid: {
			responseType: "badRequest",
			description: "",
		},
		ok: {
			responseType: "ok",
			description: "",
		},
	},

	fn: async function (inputs, exits) {
		sails.log("action user/art-collections/create started");

		try {
			let obj = { ...inputs };
			sails.log(obj);
			obj.user_id = obj.user.id;
			delete obj.user;

			let title_exist = await Artist_collection.count({
				user_id: obj.user_id,
				title: obj.title,
			});
			if (title_exist) {
				return exits.ok({
					status: false,
					message: "Collection with same title already exists",
				});
			}
			if (inputs.vibes) {
				let vibes_count = await Vibe.count({ id: inputs.vibes });
				if (vibes_count != inputs.vibes.length) {
					return exits.ok({
						status: false,
						message: "Some vibes are invalid",
					});
				}
			}
			let created = await Artist_collection.create(obj).fetch();
			if (created) {
				for (vibe of inputs.vibes) {
					await Artist_collection_vibe.create({
						vibe,
						collection: created.id,
					});
				}
			}
			created.pin_like_count = 0;
			sails.log("action user/art-collections/create ended");
			return exits.success({
				status: true,
				message: "Collection created successfully",
				data: created,
			});
		} catch (err) {
			sails.log.error(`Error in action user/art-collections/create. ${err}`);
			return exits.invalid(
				err.message || "Server error: can not create user collection"
			);
		}
	},
};
