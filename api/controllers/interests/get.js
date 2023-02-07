module.exports = {
  friendlyName: "Get",

  description: "Get interests",

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
      "Running interests/get.js with inputs " + JSON.stringify(inputs)
    ); 
    try {
      let where = { id: { "!=": null } };
      if (inputs.search_text) {
        where.title = { contains: inputs.search_text };
      }
      interestsList = await Interest.find({
        where,
        select: ["id", "title", "image"],
      })
        .skip(inputs.offset)
        .limit(inputs.limit);

      if (interestsList.length) {
        selected = await User_interest.find({
          user_id: inputs.user.id,
          interest: _.map(interestsList, "id"),
        });
      }
      for (il of interestsList) {
        il.is_selected = !_.isEmpty(_.find(selected, { interest: il.id }));
      }

      return exits.ok({
        status: true,
        message: "interests Listed Successfully",
        data: interestsList,
      });
    } catch (err) {
      sails.log.error("error calling interests/get.js", err.message);
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
