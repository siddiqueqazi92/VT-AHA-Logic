module.exports = {
  friendlyName: "Update profile",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },

    name: {
      type: "string",
      required: false,
    },
    username: {
      type: "string",
      required: true,
    },
    bio: {
      type: "string",
      required: false,
    },
    profile_image: {
      type: "string",
      required: false,
    },
    cover_image: {
      type: "string",
      required: false,
    },
    facebook: {
      type: "string",
      required: false,
    },
    instagram: {
      type: "string",
      required: false,
    },
    tiktok: {
      type: "string",
      required: false,
    },
    dribble: {
      type: "string",
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
    sails.log("action user/users/update started");

    try {
      let obj = { ...inputs };
      delete obj.address
      let community_name = null
      sails.log(obj);
      if (obj.username) {
        let username_exist = await User.count({
          username: obj.username,
          user_id: { "!=": inputs.user.id },
        });
        if (username_exist) {
          return exits.ok({
            status: false,
            message: "Username already taken",
          });
        }

       community_name = await sails.helpers.getCommunityName(
        inputs.user.id,
        obj.username + "'s Community"
      );
      }
      obj.user_id = obj.user.id;
      delete obj.user;

      let created = await User.updateOrCreate({ user_id: inputs.user.id }, obj);

      if (inputs.address) {
        inputs.address.user_id = inputs.user.id
        updated = await Artist_address.updateOrCreate(
          { user_id: inputs.user.id },
          inputs.address
        );
      }
     
      if (inputs.profile_image) {
        await Community.createOrUpdateCommunity(
          inputs.user.id,
          community_name,
          inputs.profile_image
        );
      }
      sails.log("action user/edit/profile ended");
      return exits.success({
        status: true,
        message: "User profile updated successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action user/edit/profile. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not edit user profile"
      );
    }
  },
};
