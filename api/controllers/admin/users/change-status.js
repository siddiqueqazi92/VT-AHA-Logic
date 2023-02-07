module.exports = {
  friendlyName: "Change user status",

  description: "Get user.",

  inputs: {
    // admin: {
    //   type: 'ref',
    //   required: true,
    //   description: 'logged in admin'
    // },
    user_id: {
      type: "string",
      required: true,
    },
    is_active: {
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
    updated: {
      responseType: "updated",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Running admin/users/change-status.js with inputs " +
        JSON.stringify(inputs)
    );
    try {
      let where = { user_id: inputs.user_id };

      let user = await User.findOne({
        where: where,
        select: ["is_active"],
      });

      if (!user) {
        return exits.ok({
          status: false,
          message: "Invalid user id",
          data: [],
        });
      }
      await User.updateOne(where).set({ is_active: inputs.is_active });
      return exits.updated({
        status: true,
        message: "Status changed successfully",
        data: [],
      });
    } catch (err) {
      sails.log.error(
        "error calling admin/users/change-status.js",
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
