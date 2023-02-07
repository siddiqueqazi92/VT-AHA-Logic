module.exports = {
  friendlyName: "Social login",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    user_id: {
      type:'string',
    },   
    email: {
      type: "string",
      required: false,
      allowNull:true
    },
    name: {
      type: "string",
      required: false,
    },
    username: {
      type: "string",
      required: false,
    },
    is_artist: {
      type: "boolean",
      required: false,
      defaultsTo:false
    },
   
    profile_image: {
      type: "string",
      required: false,
    },
    country: {
			type: "string",
			required: false,
			defaultsTo:"United States of America"
    },
     token_type: {
      type: 'string',
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
    sails.log(`action user/users/update started. Inputs: ${JSON.stringify(inputs)}`);
    
    try {
      let user_id = inputs.user_id || inputs.user.id
      let obj = { ...inputs };
   
      sails.log(obj);
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
      let existing_data = await User.findOne({ where: { user_id }, select: ['is_artist'] })
      if (existing_data) {
        obj.is_artist = existing_data.is_artist
      }
      obj.user_id = user_id;
      delete obj.user;
      obj.login_type = inputs.token_type
      await User.updateOrCreate({ user_id: user_id }, obj);     
      let is_artist = inputs.is_artist || false
         
      await Community.addUserInAhaCommunity(user_id)
      let user = await User.getProfile(user_id)
      sails.log("action user/edit/social-login ended");
      return exits.success({
        status: true,
        message: "User logged in successfully",
        data: user,
      });
    } catch (err) {
      sails.log.error(`Error in action user/edit/social-login. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not edit user social login"
      );
    }
  },
};
