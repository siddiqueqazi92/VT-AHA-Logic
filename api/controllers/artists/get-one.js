module.exports = {
  friendlyName: "Get one",

  description: "Get one artist",

  inputs: {
    user: {
      type: "ref",
    },
    user_id: {
      type: "string",
      required:true
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
      "Running artists/get.js with inputs " + JSON.stringify(inputs)
    );
  
    try {
      let where = { user_id:inputs.user_id, is_active: true };
      let select = ["user_id", "name", "username","is_artist", "profile_image","bio","cover_image","facebook","instagram","tiktok","dribble","wallet"];     

      let artists = await User.getArtists(where,select,inputs.user,0,1);
      if (artists.length){
        let data = artists[0]
        data.number_of_following = await Artist_follower.count({follower_id:inputs.user_id})
        data.number_of_followers = await Artist_follower.count({ artist_id: inputs.user_id })
        
        data.address = await User.getArtistAddress(inputs.user_id)
        return exits.success({
          status: true,
          message: "Artist Found Successfully",
          data ,
        });
      }
      return exits.ok({
        status: false,
        message: "Artists not found",
      });
    } catch (err) {
      sails.log.error("error calling artists/get.js", err.message);
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
