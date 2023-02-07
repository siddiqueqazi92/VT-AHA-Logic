module.exports = {
  friendlyName: "Get",

  description: "Get communities",

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
      "Running communities/get.js with inputs " + JSON.stringify(inputs)
    );
  
    try {
      let where = { id: { "!=": null } };
      if (inputs.search_text) {
        where.name = { contains: inputs.search_text };
      }
      communitiesList = await Community.find({
        where,
        select: ["id", "name", "image"],
      })
        .skip(inputs.offset)
        .limit(inputs.limit);
      if (communitiesList.length) {
        following = await Community_follower.find({
          follower_id: inputs.user.id,
          community: _.map(communitiesList, "id"),
        });
      }
      for (cl of communitiesList) {
        cl.is_following = !_.isEmpty(_.find(following, { community: cl.id }));
      }
     
      return exits.ok({
        status: true,
        message: `${communitiesList.length} Communities Listed Successfully`,
        data: communitiesList,
      });
    } catch (err) {
      sails.log.error("error calling communities/get.js", err.message);
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
