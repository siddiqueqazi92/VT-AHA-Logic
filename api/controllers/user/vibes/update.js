module.exports = {
  friendlyName: "Save vibes",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    vibes: {
      type: "ref",
      required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/vibes/update started");
    try {
      let vibes = inputs.vibes;
      vibe_count = await Vibe.count({ id: vibes });
      if (vibe_count !== vibes.length) {
        return exits.invalid("Some vibe ids are invalid");
      }
      vibes = vibes.map((v) => {
        return {
          user_id: inputs.user.id,
          vibe: v,
        };
      });

      await User_vibe.destroy({ user_id: inputs.user.id });
      let user_vibes = await User_vibe.createEach(vibes).fetch();
      sails.log("action user/vibes/update ended");
      return exits.success({
        status: true,
        message: "Your vibes have been updated successfully",
        data: user_vibes,
      });
    } catch (err) {
      sails.log.error(`Error in action user/vibes/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not update user vibes"
      );
    }
  },
};
