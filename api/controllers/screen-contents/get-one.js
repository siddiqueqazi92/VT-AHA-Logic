module.exports = {
  friendlyName: "Get Screen content",

  description: "Get screen content",

  inputs: {
    key: {
      type: "string",
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
      "Running screen-contents/get-one.js with inputs " + JSON.stringify(inputs)
    );

    try {
      let content = await Screen_content.find({ key: inputs.key });
      if (!content.length) {
        return exits.invalid({ status: false, message: "Not found" });
      }
      content = content[0];

      let data = {};
      data[content.key] = content.en;
      return exits.ok({
        status: true,
        message: "Found Successfully",
        data: data,
      });
    } catch (err) {
      sails.log.error("error calling screen-contents/get-one.js", err.message);
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
