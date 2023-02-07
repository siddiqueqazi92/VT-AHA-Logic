module.exports = {
  friendlyName: "Get",

  description: "Get vibes",

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
      "Running vibes/get.js with inputs " + JSON.stringify(inputs)
    );

    let where = { id: { "!=": null } };
    if (inputs.search_text) {
      where.title = { contains: inputs.search_text };
    }
    
    try {
      vibesList = await Vibe.getVibes(where,inputs.offset,inputs.limit)
       
      if (vibesList.length) {
        selected = await User_vibe.find({
          user_id: inputs.user.id,
          vibe: _.map(vibesList, "id"),
        });

        for (vl of vibesList) {
          vl.is_selected = !_.isEmpty(_.find(selected, { vibe: vl.id }));
        }
        return exits.success({
          status: true,
          message: "Vibes Listed Successfully",
          data: vibesList,
        });
      }
      return exits.ok({
        status: true,
        message: "Vibes not found",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling vibes/get.js", err.message);
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
