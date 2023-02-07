module.exports = {
  friendlyName: "Get community",

  description: "Get one community.",

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
      "Running admin/communities/get-one.js with inputs " +
        JSON.stringify(inputs)
    );
    try {
      let where = { id: inputs.id };

      let community = await Community.findOne({
        where: where,
        select: ["id", "name", "image", "createdAt"],
      });

      if (community) {
        community.follower_count = await Community_follower.count({community:community.id})
        community.drop_count = await Community_art.count({community:community.id})
        return exits.success({
          status: true,
          message: `community record found`,
          data: community,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error(
        "error calling admin/communities/get-one.js",
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
