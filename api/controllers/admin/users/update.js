module.exports = {
  friendlyName: "Update user",

  description: "Update user.",

  inputs: {
    // admin: {
    //   type: 'ref',
    //   required: true,
    //   description: 'logged in admin'
    // },
    user_id: {
      type: "string",
      required: true,
    },
    name: {
      type: "string",
      required: false,
      allowNull: true,
    },
    username: {
      type: "string",
      required: false,
      allowNull: true,
    },
    bio: {
      type: "string",
      required: false,
    },
    email: {
      type: "string",
      required: false,
      allowNull: true,
      email: true,
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
    vibes: {
      type: "ref",
      required: false,
    },
    interests: {
      type: "ref",
      required: false,
    },

    is_artist: {
      type: "boolean",
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
  },

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Running admin/users/create.js with inputs " + JSON.stringify(inputs)
    );
    try {
      let obj = { ...inputs };
      let vibes = obj.vibes;
      delete obj.vibes;
      let interests = obj.interests;
      delete obj.interests;
      let communities = obj.communities;
      delete obj.communities;
      if (!_.isUndefined(inputs.contact) && !_.isEmpty(inputs.contact)) {
        
        obj.country_code = inputs.contact.country_code
        obj.contact = inputs.contact.number

        let other_user = await User.findOne({
          user_id: { "!=": inputs.user_id },
          country_code: obj.country_code,
          contact: obj.contact,
        });
        if (other_user) {
          return exits.success({
            status: false,
            message: "Phone number already taken",
            // data: { id: null },
          });
        }
      }
      if (obj.cover_image) {
        is_valid_url = await sails.helpers.isValidUrl(obj.cover_image);
        if (is_valid_url === false) {
          obj.cover_image = await sails.helpers.aws.uploadFile(
            obj.cover_image,
            "users"
          );
        }
      }
      if (obj.profile_image) {
        is_valid_url = await sails.helpers.isValidUrl(obj.profile_image);
        if (is_valid_url === false) {
          obj.profile_image = await sails.helpers.aws.uploadFile(
            obj.profile_image,
            "users"
          );
        }
      }
      let user = await User.updateOne({ user_id: obj.user_id }).set(obj);
      if (user) {
        if (vibes) {
          await User_vibe.destroy({ user_id: user.user_id });
          for (vibe of vibes) {
            await User_vibe.create({
              user_id: user.user_id,
              vibe,
            });
          }
        }
        if (interests) {
          await User_interest.destroy({ user_id: user.user_id });
          for (interest of interests) {
            await User_interest.create({
              user_id: user.user_id,
              interest,
            });
          }
        }
        // if (communities) {
        //   await Community_follower.destroy({ follower_id: user.user_id });
        //   for (community of communities) {
        //     await Community_follower.create({
        //       follower_id: user.user_id,
        //       community,
        //     });
        //   }
        // }
        if (inputs.address) {
          await Artist_address.destroy({ user_id: user.user_id });
          inputs.address.user_id = user.user_id;
          await Artist_address.create(inputs.address);
        }
        return exits.success({
          status: true,
          message: "User updated successfully",
        });
      }
    } catch (err) {
      sails.log.error("error calling admin/users/create.js", err.message);
      if (
        !_.isUndefined(err.response) &&
        !_.isUndefined(err.response.data) &&
        !_.isUndefined(err.response.status)
      ) {
        let [exitsName, responseData] = await sails.helpers.response.with({
          status: err.response.status,
          data: err.response.data,
        });
        return exits[exitsName](responseData);
      }
      return exits.ok({
        status: false,
        data: [],
        message: "Unknown server error.",
      });
    }
  },
};
