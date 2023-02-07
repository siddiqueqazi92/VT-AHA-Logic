module.exports = {
  friendlyName: "Delete collection",

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
    delete_pinned_items: {
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
    sails.log("action user/collections/delete started");

    try {
      let collection = await User_collection.findOne({
        id: inputs.id,
        user_id: inputs.user.id,
      });
      if (!collection) {
        return exits.ok({ status: false, message: "Invalid ID" });
      }

      let deleted = await User_collection.deleteOne(collection.id,inputs.delete_pinned_items);
      if (!deleted) {
        return exits.ok({
          status: false,
          message: "Unable to delete collection",
        });
      }
    
      sails.log("action user/collections/delete ended");
      return exits.success({
        status: true,
        message: "Collection deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action user/collections/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not delete user collection"
      );
    }
  },
};
