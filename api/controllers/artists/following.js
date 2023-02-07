module.exports = {
  friendlyName: "Get",

  description: "Get artists user follows",

  inputs: {
    user: {
      type: "ref",
    },
    artist_id:{
      type:'string',
      required:false
    },
    search_text: {
			type: "string",
		  },
    offset: {
      type: "number",
      defaultsTo: 0,
    },
    limit: {
      type: "number",
      defaultsTo: 1000,
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
      "Running artists/following.js with inputs " + JSON.stringify(inputs)
    );
 
    try {
      let artist_id = inputs.artist_id || inputs.user.id
      let following = await Artist_follower.find({where:{follower_id:artist_id},select:["artist_id"]})
      following = _.map(following,"artist_id");
      let where = { is_active: true, user_id: following };
      if (inputs.search_text) {        
				where.or = [{ username: { contains: inputs.search_text } },{ name: { contains: inputs.search_text } }];
			  }

      let  select =["user_id", "name", "username", "profile_image","is_artist"]
     
      let artists = await User.getArtists(where,select,inputs.user,inputs.offset,inputs.limit);
      if (artists.length) {
        let current_user = _.find(artists, { id: inputs.user.id });
        if (current_user) {        
          artists.splice(artists.findIndex(x => x.id == current_user.id), 1);
          artists.splice(0, 0, current_user);
        }
        return exits.success({
          status: true,
          message: "Artists Listed Successfully",
          data: artists,
        });
      }
      return exits.ok({
        status: false,
        message: "Artists not found",        
      });
    
    } catch (err) {
      sails.log.error("error calling artists/following.js", err.message);
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
