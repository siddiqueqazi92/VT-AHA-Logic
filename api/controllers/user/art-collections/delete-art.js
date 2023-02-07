module.exports = {
	friendlyName: "Delete art from collection",

	description: "",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		collection_id: {
			type: "number",
			required: true,
		},
		art_id: {
			type: "ref",
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
		sails.log("action user/art-collections/delete-art started");

		try {
			let art_collection = await Art_collection.find({
				art: inputs.art_id,
				collection: inputs.collection_id,
			}).populate("collection");
			if (!art_collection.length) {
				return exits.ok({
					status: false,
					message: "Invalid ID",
				});
			}
			if (art_collection[0].collection.user_id !== inputs.user.id) {
				return exits.ok({
					status: false,
					message: "Invalid ID",
				});
			}			

			await Art_collection.destroy({ id: _.map(art_collection, "id") });
			let user = await User.findOne({
				where: { user_id: inputs.user.id },
				select: ["user_id", "country"],
			  });     
			let arts = await Art.getArts(
				user,
				{id:inputs.art_id},
				0,
				inputs.art_id.length
			  );
			sails.log("action user/art-collections/delete-art ended");
			return exits.success({
				status: true,
				message: "Your post has been deleted from collection successfully",
				data:arts
			});
		} catch (err) {
			sails.log.error(
				`Error in action user/art-collections/delete-art. ${err}`
			);
			return exits.invalid(
				err.message || "Server error: can not delete user collection"
			);
		}
	},
};
