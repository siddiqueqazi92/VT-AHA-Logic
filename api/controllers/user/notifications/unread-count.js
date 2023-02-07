module.exports = {
  friendlyName: "Get unread count user notifications",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    
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
    sails.log("action user/notifications/unread-count started");
    try {
      let unread_count = await sails.helpers.notifications.unreadCount(inputs.user.id)     
    
      sails.log("action user/notifications/unread-count ended");
      return exits.success({
        status: true,
        message: "Notifications count",
        data: {unread_count},
      });
    } catch (err) {
      sails.log.error(`Error in action user/notifications/unread-count. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user notifications count"
      );
    }
  },
};
