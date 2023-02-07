const { getPinCountArtistCollection } = require("../../../util");

module.exports = {
  friendlyName: "Update collection",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    id: {
      type: "number",
      required: true,
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
    sails.log("action user/collections/update started");

    try {
      let obj = { ...inputs };
      delete obj.vibes
      sails.log(obj);
      let collection = await Artist_collection.findOne({
        id: inputs.id,
        user_id: inputs.user.id,
      });
      if (!collection) {
        return exits.ok({ status: false, message: "invalid id" });
      }
      let title_exist = await Artist_collection.count({
        user_id: inputs.user.id,
        id:{"!=":collection.id},
				title: obj.title,
			});
			if (title_exist) {
				return exits.ok({
					status: false,
					message: "Collection with same title already exists",
				});
			}
      //obj.user_id = obj.user.id;
      delete obj.user;

      let updated = await Artist_collection.updateOne({
        id: collection.id,
      }).set(obj);
      if (updated && inputs.vibes) {
        let vibes_count = await Vibe.count({ id: inputs.vibes });
        if (vibes_count != inputs.vibes.length) {
          return exits.ok({
            status: false,
            message: "Some vibes are invalid",
          });
        }
        await Artist_collection_vibe.destroy({ collection: updated.id });
        for (vibe of inputs.vibes) {
          await Artist_collection_vibe.create({
            vibe,
            collection: updated.id,
          });
        }
      }
      updated.is_my_collection = updated.user_id == inputs.user.id
      //getting pinned counts for artist_collections
      let pinned_art_collections_counts = await User_pinned_art.getPinnedCounts([updated.id], "artist_collection_id");
      updated.pin_like_count = getPinCountArtistCollection(pinned_art_collections_counts,updated.id)
      sails.log("action user/collections/update ended");
      return exits.success({
        status: true,
        message: "Collection updated successfully",
        data: updated,
      });
    } catch (err) {
      sails.log.error(`Error in action user/collections/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user collection"
      );
    }
  },
};
