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
    is_public: {
      type: "boolean",
      required: false,
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
      sails.log(obj);
      let collection = await User_collection.findOne({
        id: inputs.id,
        user_id: inputs.user.id,
      });
      if (!collection) {
        return exits.ok({ status: false, message: "Invalid ID" });
      }
      //obj.user_id = obj.user.id;
      delete obj.user;

      let updated = await User_collection.updateCollection(collection.id,obj)

      updated.is_my_collection = updated.user_id == inputs.user.id
      sails.log("action user/collections/update ended");
      return exits.success({
        status: true,
        message: "Collection updated successfully",
        data: updated,
      });
    } catch (err) {
      sails.log.error(`Error in action user/collections/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not update user collection"
      );
    }
  },
};
