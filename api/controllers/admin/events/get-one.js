module.exports = {
  friendlyName: "Get event",

  description: "Get one event.",

  inputs: {
    // admin: {
    //   type: 'ref',
    //   required: true,
    //   description: 'logged in admin'
    // },
    id: {
      type: 'string',
      required:true
    }
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
      "Running admin/events/get-one.js with inputs " + JSON.stringify(inputs)
    );
    try {
      let where = { _id: inputs.id };

      let event = await Event.findOne({
        where: where,
        // select: ["id", "title", "image", "createdAt"],
      });

      if (event) {
        event.id = event._id
        delete event._id
        return exits.success({
          status: true,
          message: `Event record found`,
          data: event,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/events/get-one.js", err.message);
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
