module.exports = {
  friendlyName: "delete community",

  description: "",

  inputs: {
    // admin: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    id: {
      type: "number",
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
    sails.log("action admin/communities/delete started");

    try {
      await Community.destroy({ id: inputs.id });
      await Community_follower.destroy({ community: inputs.id });
      sails.log("action admin/communities/delete ended");
      return exits.success({
        status: true,
        message: "Community deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action admin/communities/delete. ${err}`);
      return exits.ok(err.message || "Server error: can not update community");
    }
  },
};
