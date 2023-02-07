module.exports = {
  friendlyName: "Get",

  description: "Get settings",

  inputs: {},

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
      "Running settings/get.js with inputs " + JSON.stringify(inputs)
    );

    try {
      let settings = {};
      //these settings will be managed from admin panel later
      settings.max_video_size = 500;
      settings.max_image_size = 500;
      if (!_.isEmpty(settings)) {
        return exits.success({
          status: true,
          message: "Settings Listed Successfully",
          data: settings,
        });
      }
      return exits.ok({
        status: true,
        message: "settings not found",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling settings/get.js", err.message);
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
