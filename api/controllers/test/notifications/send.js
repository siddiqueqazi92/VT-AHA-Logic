module.exports = {
  friendlyName: "Send",

  description: "Send push notification",

  inputs: {
    id: {
      type: "string",
      description: "User ID",
      required:true
    },
    title: {
      type: 'string',
      required:true
    },
    body: {
      type: "string",
      required:true
    },

    silent: {
      type: "boolean",
      required: true,
    },
    extra_data: {
      type: "ref",
      required: true,
    },
    notification_type: {
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
      "Running test/notifications/send.js with inputs " + JSON.stringify(inputs)
    );    
    try {
      // console.log({jjj:sails.config.notification})
      await sails.helpers.firebase.sendPushNotification(
        inputs.id,        
        inputs.title,
        inputs.body,
        inputs.silent,
        JSON.stringify(inputs.extra_data),
        inputs.notification_type
      );
 
        return exits.success({
          status: true,
          message: "Notification Send Successfully",
        });
     
    } catch (err) {
      sails.log.error("error calling test/notifications/send.js", err.message);
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
