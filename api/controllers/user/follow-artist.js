module.exports = {
  friendlyName: "Follow artist",

  description: "Follow artist",

  inputs: {
    user: {
      type: "ref",
    },
    artist_id: {
      type: "string",
      required: true,
    },
    follow: {
      type: "boolean",
      required: true,
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
      "Running user/follow-artist.js with inputs " + JSON.stringify(inputs)
    );
    try {
      // let artist = await Artist.findOne(inputs.artist_id);
      // if (!artist) {
      //   return exits.invalid("Invalid artist id");
      // }
      let where = {
        artist_id: inputs.artist_id,
        follower_id: inputs.user.id,
      };
      if (inputs.follow == true) {
        await Artist_follower.updateOrCreate(where, {
          artist_id: inputs.artist_id,
          follower_id: inputs.user.id,
        });
        await sails.helpers.notifications.sendAndSave(sails.config.notification.type.user_followed_you,{following_user_id:inputs.artist_id,user:inputs.user});
      } else {
        await Artist_follower.destroy(where);
      }
      let data = {};
      data.number_of_following = await Artist_follower.count({follower_id:inputs.artist_id})
      data.number_of_followers = await Artist_follower.count({ artist_id: inputs.artist_id })
           
      return exits.ok({
        status: true,
        message: "Proceeded Successfully",
        data:data
      });
    } catch (err) {
      sails.log.error("error calling user/follow-artist.js", err.message);
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
      return exits.serverError({
        status: false,
        data: [],
        message: "Unknown server error.",
      });
    }
  },
};
