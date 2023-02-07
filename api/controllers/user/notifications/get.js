module.exports = {
  friendlyName: "Get user notifications",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    offset: {
      type: 'number',
      defaultsTo:0
    },
    limit: {
      type: 'number',
      defaultsTo:1000
    }
  },

  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
    invalid: {
      responseType: "invalid",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/notifications/get started");
    try {
      let user_notifications = await sails.helpers.notifications.get(inputs.user.id,inputs.offset,inputs.limit)
      if (!user_notifications.length) {
        return exits.ok({
          status: false,
          message: "notifications not found",        
        });
      }
    
      sails.log("action user/notifications/get ended");
      return exits.success({
        status: true,
        message: "notifications found successfully",
        data: user_notifications,
      });
    } catch (err) {
      sails.log.error(`Error in action user/notifications/get. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user notifications"
      );
    }
  },
};
