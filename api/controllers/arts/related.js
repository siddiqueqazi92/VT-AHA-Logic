module.exports = {
  friendlyName: "Get related suggestions",

  description: "Get related arts",

  inputs: {
    user: {
      type: "ref",
    },
    art_id:{
      type:'number',
      required:false
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
      "Running arts/related.js with inputs " + JSON.stringify(inputs)
    );

    try {
      let arts = await Art.getRelatedSuggesstions(inputs.user,inputs.art_id, inputs.offset, inputs.limit, [
        "id",      
        "title"      
      ]);
      if (!arts.length) {
        return exits.ok({
          status: false,
          message: "Arts not found",          
        });
      }
      for (art of arts) {
        if (!art.thumbnail) {
          art.thumbnail = 'https://ahauserposts.s3.amazonaws.com/video-files.png'
        }
      }
      return exits.success({
        status: true,
        message: "Arts Listed Successfully",
        data: arts,
      });
    } catch (err) {
      sails.log.error("error calling arts/related.js", err.message);
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
