module.exports = {
  friendlyName: "Get",

  description: "Get art collections",

  inputs: {
    user: {
      type: "ref",
    },
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
      "Running user/collections/get-ones.js with inputs " +
        JSON.stringify(inputs)
    );

    try {
      collection = await Artist_collection.findOne({
        where: { user_id: inputs.user.id, id: inputs.id },
        select: ["id", "title", "image", "is_public"],
      });
      if (!collection) {
        return exits.ok({
          status: false,
          message: "Collection not found",
          data: collection,
        });
      }

      let vibes = await Artist_collection_vibe.find({
        collection: collection.id,
      }).populate("vibe");
      collection.vibes = _.map(vibes, "vibe");
      return exits.success({
        status: true,
        message: "Collection Found Successfully",
        data: collection,
      });
    } catch (err) {
      sails.log.error("error calling user/collections/get-one.js", err.message);
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
