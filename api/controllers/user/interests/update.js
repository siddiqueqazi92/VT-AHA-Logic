module.exports = {
  friendlyName: "Save interests",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    interests: {
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
    sails.log("action user/interests/update started");
    try {
      let interests = inputs.interests;
      interest_count = await Interest.count({ id: interests });
      if (interest_count !== interests.length) {
        return exits.invalid({ status: false, message: "Some interest ids are invalid"});
      }
      interests = interests.map((v) => {
        return {
          user_id: inputs.user.id,
          interest: v,
        };
      });

      await User_interest.destroy({ user_id: inputs.user.id });
      let user_interests = await User_interest.createEach(interests).fetch();
      sails.log("action user/interests/update ended");
      return exits.success({
        status: true,
        message: "Your interests have been updated successfully",
        data: user_interests,
      });
    } catch (err) {
      sails.log.error(`Error in action user/interests/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not update user interests"
      );
    }
  },
};
