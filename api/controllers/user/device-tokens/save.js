module.exports = {
  friendlyName: "Save",

  description: "Save Device Token",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    device_token: {
      type: "string",
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
    sails.log("action user/device-tokens/save started");

    try {
     await User.updateOne({user_id:inputs.user.id}).set({device_token:inputs.device_token})
      sails.log("action user/device-tokens/save ended");
      return exits.success({
        status: true,
        message: "Saved successfully",        
      });
    } catch (err) {
      sails.log.error(`Error in action user/addresses/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user address"
      );
    }
  },
};
