module.exports = {
  friendlyName: "delete vibe",

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
    sails.log("action admin/vibes/delete started");

    try {
      await Vibe.destroy({ id: inputs.id });
      await User_vibe.destroy({ vibe: inputs.id });
      sails.log("action admin/vibes/delete ended");
      return exits.success({
        status: true,
        message: "vibe deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action admin/vibes/delete. ${err}`);
      return exits.ok(err.message || "Server error: can not update vibe");
    }
  },
};
