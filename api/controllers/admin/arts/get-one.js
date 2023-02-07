module.exports = {
  friendlyName: "Get art",

  description: "Get one art.",

  inputs: {
    // admin: {
    //   type: 'ref',
    //   required: true,
    //   description: 'logged in admin'
    // },
    id: {
      type: "number",
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
      "Running admin/arts/get-one.js with inputs " + JSON.stringify(inputs)
    );
    try {
      let where = { id: inputs.id, deletedAt: null };

      let art = await Art.findOne({
        where: where,
        // select: ["id", "title", "image", "createdAt"],
      })
        .populate("vibes")
        .populate("resources")
        .populate("sizes")
        .populate("collections");

      if (art) {
        art.artist = await User.findOne({
          where: { user_id: art.artist_id },
          select: ["username"],
        });
        art.template = Art.getTemplate(art.template)
        if (art.vibes.length) {
          art.comment_count = await Comment.count({art_id:art.id})
          art.vibe_ids = _.map(art.vibes,"vibe")
          art.vibes = await Vibe.find({
            where: { id: _.map(art.vibes, "vibe") },
            select: ["id", "title"],
          });
        }
        if(art.collections.length){
          art.collection_ids = _.map(art.collections,"collection")
        }
        for (s of art.sizes) {
          s.template = Art.getTemplate(s.template)
        }
        return exits.success({
          status: true,
          message: `Art record found`,
          data: art,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/arts/get-one.js", err.message);
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
