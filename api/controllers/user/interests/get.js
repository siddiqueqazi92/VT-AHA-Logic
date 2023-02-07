module.exports = {
  friendlyName: "Get user interests",

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
    sails.log("action user/interests/get started");
    try {
      let user_interests = await User_interest.find({
        user_id: inputs.user.id,
      }).populate("interest");

      if (user_interests.length) {
        user_interests = _.map(user_interests, "interest");
      }
      sails.log("action user/interests/get ended");
      return exits.success({
        status: true,
        message: "Interests found successfully",
        data: user_interests,
      });
    } catch (err) {
      sails.log.error(`Error in action user/interests/get. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user interests"
      );
    }
  },
};
