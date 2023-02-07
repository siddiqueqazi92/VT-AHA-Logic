module.exports = {
  friendlyName: "Create user",

  description: "Create user.",

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
    },
    username: {
      type: "string",
      required: false,
    },
    bio: {
      type: "string",
      required: false,
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
      // let communities = obj.communities;
      // delete obj.communities;

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
      if (obj.contact) {
        obj.country_code = obj.contact.country_code
        obj.contact = obj.contact.number
      }
      let user = await User.create(obj).fetch();
      if (user) {
        if (vibes) {
          for (vibe of vibes) {
            await User_vibe.create({
              user_id: user.user_id,
              vibe,
            });
          }
        }
        if (interests) {
          for (interest of interests) {
            await User_interest.create({
              user_id: user.user_id,
              interest,
            });
          }
        }
        if (inputs.is_artist) {
          let community_name = await sails.helpers.getCommunityName(
            user.user_id,
            user.username + "'s Community"
          );
          await Community.createOrUpdateCommunity(
            user.user_id,
            community_name,
            user.profile_image || inputs.user.profile_image || null
          );
        }
       
        await Community.addUserInAhaCommunity(user.user_id)
        if (inputs.address) {
          inputs.address.user_id = user.user_id;
          await Artist_address.create(inputs.address);
        }
        return exits.success({
          status: true,
          message: "User created successfully",
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
