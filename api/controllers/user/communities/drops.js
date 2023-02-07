module.exports = {
  friendlyName: "Get user communities",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    community_id: {
      type: "number",
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
    sails.log("action user/communities/drops started");
    try {
      let arts = await Community_art.find({
        where: { community: inputs.community_id },
        select: ["art"],
      })
      if (!arts.length) {
        return exits.ok({
          status: false,
          message: "Arts not found",
        });
      }
      let where = {
        deletedAt: null,
        id: _.map(arts, "art"),
        type: global.ART_TYPE.DROP,
      };
      arts = await Art.find({
        where,
        select: ["id", "title", "artist_id", "thumbnail"],
      })
        .skip(inputs.offset)
        .limit(inputs.limit)
        .sort("id DESC");

      if (!arts.length) {
        return exits.ok({
          status: false,
          message: "Arts not found",
        });
      }
      for (art of arts) {
        art.is_my_post = art.artist_id == inputs.user.id;
      }
      sails.log("action user/communities/drops ended");
      return exits.success({
        status: true,
        message: "Arts found successfully",
        data: arts,
      });
    } catch (err) {
      sails.log.error(`Error in action user/communities/drops. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user communities"
      );
    }
  },
};
