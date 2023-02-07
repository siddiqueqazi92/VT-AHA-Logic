module.exports = {
  friendlyName: "delete",

  description: "delete Device Token",

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
    sails.log("action user/device-tokens/delete started");

    try {
     await User.updateOne({user_id:inputs.user.id}).set({device_token:null})
      sails.log("action user/device-tokens/delete ended");
      return exits.success({
        status: true,
        message: "Deleted successfully",        
      });
    } catch (err) {
      sails.log.error(`Error in action user/device-tokens/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not delete user device token"
      );
    }
  },
};
