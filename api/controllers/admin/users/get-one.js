module.exports = {
  friendlyName: "Get user",

  description: "Get user.",

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
      "Running admin/user/get-one.js with inputs " + JSON.stringify(inputs)
    );
    try {
      let where = { user_id: inputs.user_id };

      let user = await User.findOne({
        where: where,
        select: [
          "user_id",
          "name",          
          "username",
          "country_code",
          "contact",
          "email",
          "profile_image",
          "is_artist",
          "bio",
          "cover_image",
          "facebook",
          "instagram",
          "tiktok",
          "dribble",
          "createdAt",
          "login_type"
        ],
      });

      if (user) {
        user.id = user.user_id;
        user.vibes = await User_vibe.find({
          where: { user_id: user.user_id },
          select: ["vibe"],
        }).populate("vibe");
        user.user_vibes = _.map(user.vibes, "vibe");
        user.vibes = _.map(user.user_vibes, "id");
        user.interests = await User_interest.find({
          where: { user_id: user.user_id },
          select: ["interest"],
        }).populate("interest");
        user.user_interests = _.map(user.interests, "interest");
        user.interests = _.map(user.user_interests, "id");

        user.communities = await Community_follower.find({
          where: { follower_id: user.user_id },
          select: ["community"],
        });
        user.communities = _.map(user.communities, "community");        
        user.community_count = user.communities.length
        user.address = await Artist_address.find({
          user_id: user.user_id,
        }).limit(1);
        if (user.address.length) {
          user.address = user.address[0];
        } else {
          user.address = {
            city: null,
            state: null,
            country: null,
          };
        }
        user.addresses = await User_address.find({
          user_id: user.user_id,
        }).sort('is_selected DESC')
        user.address_count = await User_address.countAddresses(user.id)
        user.order_count = await Order.getUserOrderCount(user.id)
        if (user.is_artist == true) {
         user.sale_count = await Order.getArtistSaleCount(user.id)
         user.art_count = await Art.countArts(user.id)
         user.art_collection_count = await Artist_collection.countArtistCollections(user.id)
        }
        let following_counts = await User.getFollowingCounts([user.id])
        user.following_count = following_counts.length > 0 ? parseInt(following_counts[0].total) : 0

        let follower_counts = await User.getFollowerCounts([user.id])
        user.follower_count = follower_counts.length > 0 ? parseInt(follower_counts[0].total) : 0
        return exits.success({
          status: true,
          message: `User record found`,
          data: user,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/user/get-one.js", err.message);
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
