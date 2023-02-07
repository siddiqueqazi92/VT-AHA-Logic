module.exports = {
  friendlyName: "Get profile",

  description: "",

  inputs: {
    id: {
      type: "string",
      required: true,
    },
    login_attempts: {
      type:"number",
    }, 
    country: {
      type: 'string',
      required: false,		
      allowNull:true
    }
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/get/profile started");

    try {
      let user = await User.getProfile(inputs.id)
      user.address = await User.getArtistAddress(inputs.id)
      user.vibes = await User_vibe.getUserVibeIds(inputs.id)
      user.interests = await User_interest.getUserInterestIds(inputs.id)
      user.has_subimitted_all_values = true
      if (!user.cover_image) {
        user.has_subimitted_all_values = false
      }
      if (!user.address || _.isEmpty(user.address)) {
        user.has_subimitted_all_values = false
      }
      if (inputs.login_attempts) {
        user.login_attempts += inputs.login_attempts
        let updated_obj = { login_attempts: user.login_attempts }
        if (inputs.country) {
          updated_obj.country = inputs.country
        }
         await User.update({user_id:inputs.id}).set(updated_obj)
      }
      sails.log("action user/get/profile ended");
      return exits.success({
        status: true,
        message: "user profile found successfully",
        data: user,
      });
    } catch (err) {
      sails.log.error(`Error in action user/get/profile. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user profile"
      );
    }
  },
};
