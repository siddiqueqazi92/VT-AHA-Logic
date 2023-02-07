const moment = require("moment");
module.exports = {
  friendlyName: "Delete art",

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
  },

  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/arts/delete started");
    try {
      let art = await Art.findOne({ id: inputs.id, artist_id: inputs.user.id });
      if (!art) {
        return exits.ok({
          status: false,
          message: "Invalid ID",
        });
      }
      // await Art_vibe.destroy({ art: art.id });
      // await Art_resource.destroy({ art: art.id });
      // await Art_size.destroy({ art: art.id });
      // await Art_collection.destroy({ art: art.id });
      await Art.updateOne({ id: art.id }).set({
        deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      sails.log("action user/arts/delete ended");
      return exits.success({
        status: true,
        message: "Your post has been deleted",
      });
    } catch (err) {
      sails.log.error(`Error in action user/arts/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not pin/unpin art"
      );
    }
  },
};
