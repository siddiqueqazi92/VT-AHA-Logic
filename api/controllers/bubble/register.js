module.exports = {
  friendlyName: "Regiser bubble",

  description: "Register bubble user",

  inputs: {
    user_id: {
      type: "string",
    },
    email: {
      type: "string",
    },
    username: {
      type: "string",
    },
    name: {
      type: "string",
    }, 
   
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log(`action bubble/register started. Inputs: ${JSON.stringify(inputs)}`);
    
    try {
      let user_id = inputs.user_id || inputs.user.id
      let obj = { ...inputs };
      obj.login_attempts = 0
      obj.login_type = "bubble"
      if (obj.username) {
        let username_exist = await User.count({
          username: obj.username,
          user_id: { "!=": user_id },
        });
        if (username_exist) {
          return exits.ok({
            status: false,
            message: "Username already taken",
          });
        }
      }
      obj.user_id = user_id;
      delete obj.user;

      await User.updateOrCreate({ user_id }, obj);
      
      let is_artist = inputs.is_artist || false
      if (!_.isUndefined(inputs.address) && !_.isEmpty(inputs.address)) {
       is_artist = true
     }
      if (is_artist) {        
        await User.makeArtist(inputs);
      }
      await Community.addUserInAhaCommunity(user_id)
      let user = await User.getProfile(user_id)
      sails.log("action bubble/register ended");
      return exits.success({
        status: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (err) {
      sails.log.error(`Error in action bubble/register. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not edit user personal info"
      );
    }
  },
};
