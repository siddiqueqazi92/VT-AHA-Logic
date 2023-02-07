module.exports = {
  friendlyName: "Get",

  description: "Get dashboard feeds",

  inputs: {
    user: {
      type: "ref",
    },
    offset: {
      type: "number",
      defaultsTo: 0,
    },
    limit: {
      type: "number",
      defaultsTo: 10,
    },
    exclude: {
      type: 'ref',
      
    }
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
      "Running user/dashboard-feeds.js with inputs " + JSON.stringify(inputs)
    );
    let data = {feeds:[]}
    try {    
      let filtered_params = {};
      let user_vibes = await User_vibe.find({
        where: { user_id: inputs.user.id },
        select: ["vibe"],
      });
      if (user_vibes.length) {
        user_vibes = _.map(user_vibes, "vibe");
        filtered_params.vibes = user_vibes;
      }
      let following_artists = await Artist_follower.find({
        where: { follower_id: inputs.user.id },
        select: ["artist_id"],
      });
      if (following_artists.length) {
        following_artists = _.map(following_artists, "artist_id");
        filtered_params.artists = following_artists;
      }
      let country = "Pakistan";
      let user = await User.findOne({
        where: { user_id: inputs.user.id },
        select: ["user_id", "country"],
      });
      if (user) {
        country = user.country;
      }
      filtered_params.country = country;
      filtered_params.type = global.ART_TYPE.DEFAULT//simple post
      let exclude = []
      if (inputs.exclude) {
        exclude = inputs.exclude.split(',').map(Number);
        
      }
      /*
      Excluding art ids which are in private collections,but not excluding logged in user's
      arts even if it is in private collection
      */
      let exclude_ids = await Artist_collection.getCollectionArtIds(null, get = "private");
      if (exclude_ids.length) {
        exclude_ids = exclude_ids.filter(Number);      
        exclude = _.union(exclude, exclude_ids)
        let my_exclude_ids = await Artist_collection.getCollectionArtIds(inputs.user.id, get = "private");//removing logged in user's arts ids from exclude
        if (my_exclude_ids.length) {
          exclude = _.remove(exclude, function(i) {
            return (!my_exclude_ids.includes(i)); 
        });
        }        
      }      
      exclude = exclude.filter( Number );
      if (exclude.length) {       
        filtered_params.exclude = exclude
      }
      let feeds = [];      

      feeds = await Art.getArts(
        user,
        filtered_params,
        inputs.offset,
        inputs.limit
      );
    
      if (!feeds.length) {
        return exits.ok({
          status: false,
          message: `Feeds not found`,
          data: [],
        });
      }
      if (inputs.offset == 0) {        
        data.artists = await User.getSuggestedArtists(
          user,      
          0,
          12
        );
      }
      
      data.feeds = feeds
      return exits.ok({
        status: true,
        message: `${feeds.length} Feeds Listed Successfully`,
        data,
      });
    } catch (err) {
      sails.log.error("error calling user/dashboard-feeds.js", err.message);
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
