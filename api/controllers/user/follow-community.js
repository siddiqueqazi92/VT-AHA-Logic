module.exports = {
  friendlyName: "Follow community",

  description: "Follow community",

  inputs: {
    user: {
      type: "ref",
    },
    community_id: {
      type: "number",
      required: true,
    },
    follow: {
      type: "boolean",
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
      "Running user/follow-community.js with inputs " + JSON.stringify(inputs)
    );
    try {
      let community = await Community.findOne(inputs.community_id);
      if (!community) {
        return exits.invalid("Invalid community id");
      }
      let where = {
        community: community.id,
        follower_id: inputs.user.id,
      };
      if (inputs.follow == true) {
        await Community_follower.updateOrCreate(where, {
          community: community.id,
          follower_id: inputs.user.id,
        });
      } else {
        await Community_follower.destroy(where);
      }
      return exits.ok({
        status: true,
        message: "Proceeded Successfully",
      });
    } catch (err) {
      sails.log.error("error calling user/follow-community.js", err.message);
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
