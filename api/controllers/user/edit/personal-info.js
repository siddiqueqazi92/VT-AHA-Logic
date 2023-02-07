module.exports = {
  friendlyName: "Update personal info",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    user_id: {
      type:'string',
    },
    contact: {
      type: "ref",
      required: false,
      custom: function (value) {
        return (
          _.isObject(value) &&
          !_.isUndefined(value.country_code) &&
          !_.isUndefined(value.number)
        );
      },
    },
    email: {
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
    },
    vibes: {
      type: "ref",
      required: false,
    },
    interests: {
      type: "ref",
      required: false,
    },  
    address: {
      type: "ref",
      required: false,
      custom: function (value) {
        return (
          _.isObject(value) &&
          !_.isUndefined(value.city) &&
          !_.isUndefined(value.state) &&
          !_.isUndefined(value.country)
        );
      },
    },
    profile_image: {
      type: "string",
      required: false,
    },
    cover_image: {
      type: "string",
      required: false,
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
      if (obj.contact) {
        obj.country_code = obj.contact.country_code
        obj.contact = obj.contact.number
      }
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
      obj.user_id = user_id;
      delete obj.user;

      await User.updateOrCreate({ user_id: user_id }, obj);
      if (inputs.contact) {
        await sails.helpers.attachCountry(
          user_id,
          inputs.contact.country_code
        );
      }
      let is_artist = inputs.is_artist || false
      if (!_.isUndefined(inputs.address) && !_.isEmpty(inputs.address)) {
       is_artist = true
     }
      if (is_artist) {        
        await User.makeArtist(inputs);
      }
      await Community.addUserInAhaCommunity(user_id)
      let user = await User.getProfile(user_id)
      sails.log("action user/edit/personal-info ended");
      return exits.success({
        status: true,
        message: "User personal info updated successfully",
        data: user,
      });
    } catch (err) {
      sails.log.error(`Error in action user/edit/personal-info. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not edit user personal info"
      );
    }
  },
};
