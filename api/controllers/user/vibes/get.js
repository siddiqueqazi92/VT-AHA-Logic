module.exports = {
  friendlyName: "Get user vibes",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/vibes/get started");
    try {
      let user_vibes = await User_vibe.find({
        user_id: inputs.user.id,
      }).populate("vibe");

      if (user_vibes.length) {
        user_vibes = _.map(user_vibes, "vibe");
      }
      sails.log("action user/vibes/get ended");
      return exits.success({
        status: true,
        message: "Vibes found successfully",
        data: user_vibes,
      });
    } catch (err) {
      sails.log.error(`Error in action user/vibes/get. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user vibes"
      );
    }
  },
};
