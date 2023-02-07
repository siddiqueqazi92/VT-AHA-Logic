module.exports = {
  friendlyName: "Get user communities",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    filter_by: {
      type: "string",
      isIn: ['my_communities', 'following'],
      defaultsTo:"my_communities"
    },
    user_id: {
      type: "string",
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
      description: "",
    },
    ok: {
      responseType: "ok",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "action user/communities/get started with inputs " + JSON.stringify(inputs)
    );
    try {
      
      let communities = null
      inputs.user_id = inputs.user_id || inputs.user.id
      if (inputs.filter_by == 'my_communities') {
        let where = {};
        where.artist_id = inputs.user_id
        if (inputs.search_text) {
          where.name = { contains: inputs.search_text };
        }
        communities = await Community.find({where}).skip(inputs.offset,inputs.limit)
      } else {
        // let user_communities = await Community_follower.find({
        //   follower_id: inputs.user.id,
        // }).populate("community");
  
        // if (user_communities.length) {
        //   communities = _.map(user_communities, "community");
        // }
        communities = await Community.getFollowingCommunities(inputs)
      }
      if (!communities.length) {
        return exits.ok({
          status: true,
          message: "Communities not found",          
        });
      }
    
      let artist_ids = _.map(communities, "artist_id")
      let artists = await User.find({ where: { user_id: artist_ids }, select: ['user_id','profile_image']})
      let my_followings = await Community_follower.getCommunityFollowers(_.map(communities, "id"), [inputs.user.id])
      for (community of communities) {
        community.is_following = !_.isUndefined(_.find(my_followings, { community: community.id, follower_id: inputs.user.id }))
        community.artist = _.find(artists, { user_id: community.artist_id })
        community.artist.id = community.artist.user_id
        delete community.artist.user_id
      }
      sails.log("action user/communities/get ended");
      return exits.success({
        status: true,
        message: `${communities.length} Communities found successfully`,
        data: communities,
      });
    } catch (err) {
      sails.log.error(`Error in action user/communities/get. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user communities"
      );
    }
  },
};
