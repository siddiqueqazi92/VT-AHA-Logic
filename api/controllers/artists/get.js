module.exports = {
  friendlyName: "Get",

  description: "Get artists",

  inputs: {
    user: {
      type: "ref",
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
      "Running artists/get.js with inputs " + JSON.stringify(inputs)
    );
  
    try {
      let where = { user_id: { "!=": inputs.user.id }, is_artist: true, is_active: true };
      
      if (inputs.search_text) {        
        where.or = [{ username: { contains: inputs.search_text } },{ name: { contains: inputs.search_text } }];
      }
      let select = ["user_id", "name", "username", "profile_image"];     

      let artists = await User.getArtists(where,select,inputs.user,inputs.offset,inputs.limit);
      if (artists.length){
        
        return exits.success({
          status: true,
          message: "Artists Listed Successfully",
          data: { remaining_count: 0, artists: artists },
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
