module.exports = {
  friendlyName: "Get",

  description: "Get art collection with arts in it",

  inputs: {
    user: {
      type: "ref",
    },
    id: {
      type: "number",
      required: true,
    },
    artist_id: {
      type: "string",
      required: false,
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
      "Running user/art-collections/get-one-with-arts-with-arts.js with inputs " +
        JSON.stringify(inputs)
    );
      let artist_id = inputs.artist_id || inputs.user.id
    try {
      let where = { user_id: artist_id, id: inputs.id }
      if (artist_id != inputs.user.id) {
        where.is_public = true
      }
      collection = await Artist_collection.getOne(        
        where,
        inputs.user,
        ["id", "title", "image", "is_public"],
      );
      
      if (!collection) {
        return exits.ok({
          status: false,
          message: "Collection not found",
          data: collection,
        });
      }
      collection.artist = { id: collection.user_id }
      delete collection.user_id
      collection.arts = [];
      let art_ids = await Art_collection.getMultipleCollectionsArtIds([collection.id])
      if (art_ids.length) {
        inputs.user.user_id = inputs.user.id
        collection.arts = await Art.getArts(
          inputs.user,
          { id: art_ids },
          0,
          art_ids.length
        );
        if (collection.arts.length && collection.arts[0].artist) {
          collection.artist = collection.arts[0].artist
        }
      }
      return exits.success({
        status: true,
        message: "Collection Found Successfully",
        data: collection,
      });
    } catch (err) {
      sails.log.error("error calling user/art-collections/get-one-with-arts.js", err.message);
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
