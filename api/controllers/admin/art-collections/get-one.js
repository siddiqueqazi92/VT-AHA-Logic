module.exports = {
  friendlyName: "Get collection",

  description: "Get one collection.",

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
      "Running admin/art-collections/get-one.js with inputs " +
        JSON.stringify(inputs)
    );
    try {
      let where = { id: inputs.id };

      let collection = await Artist_collection.findOne({
        where: where,
        select: ["id", "title","user_id","image","is_public","createdAt"],
      }).populate('vibes');

      if (collection) {
        collection.privacy = collection.is_public == true ? 'Public' : 'Private';
        collection.art_count = await Art_collection.countArtInCollection(collection.id)
        if (collection.vibes.length) {          
          collection.vibe_ids = _.map(collection.vibes,"vibe")
          collection.vibes = await Vibe.find({
            where: { id: _.map(collection.vibes, "vibe") },
            select: ["id", "title"],
          });
        }
        let select = ["user_id", "name", "username", "profile_image"]
        let where = {user_id:collection.user_id}
        collection.artist = await User.findOne({ where, select })
        return exits.success({
          status: true,
          message: `Collection record found`,
          data: collection,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error(
        "error calling admin/art-collections/get-one.js",
        err.message
      );
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
