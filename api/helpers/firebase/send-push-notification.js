const firebasePushNotifications = require("../../lib/PushNotifications/firebasePushNotifications");
const moment = require("moment");
// const uuidv1 = require("uuid/v1");
const { v1: uuidv1 } = require('uuid');

module.exports = {
  friendlyName: "Send push notification",

  description: "",

  inputs: {
    user: {
      type: "string",
      required: true,
      description: "A user id",
    },
   
    title: {
      type: "string",
    },

    body: {
      type: "string",
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

  exits: {},

  fn: async (inputs, exits) => {
    sails.log.debug("sending push notification: ");
    //sails.log.debug('sending push notification: ', { inputs });
    let user = null;
  
    user = await User.findOne({ user_id: inputs.user });
    const allowedSilentEvents = [];

    // sails.log.debug({ thisisuser: user });

    sails.log.debug(
      `send-push-notification user_id: ${user.user_id}\nTitle: ${inputs.title}\nBody: ${inputs.body}`
    );
    // return exits.success();
    if (_.isEmpty(user.device_token)) {
      sails.log.debug(`userId: ${user.user_id} noisy notifications not permitted`);
      if (!inputs.silent) {
        sails.log.debug(`userId: ${user.user_id} not sending noisy notification`);
        return exits.success();
      }
    }

    if (!inputs.silent) {
      if (!inputs.title) {
        sails.log.error(
          "helpers/send-push-notification - when notifications are noisy 'title' must be provided"
        );
      }
      if (!inputs.body) {
        sails.log.error(
          "helpers/send-push-notification - when notifications are noisy 'body' must be provided"
        );
      }

      // if (
      //   _.isArray(inputs.extra_data.tasks) &&
      //   _.isObject(inputs.extra_data.tasks[0]) &&
      //   !_.isUndefined(inputs.extra_data.tasks[0].uniquestring)
      // ) {
      //   const task = await sails.models.task.find({
      //     uniquestring: inputs.extra_data.tasks[0].uniquestring,
      //   });
      //   if (task[0].status !== global.STATUS.IN_TRANSIT) {
      //     if (
      //       !user.screen_status &&
      //       allowedSilentEvents.includes(inputs.notification_type)
      //     ) {
      //       sails.log.debug(`no need to send notification`);
      //       return exits.success();
      //     }
      //   }
      // }
      // if (
      //   !user.screen_status &&
      //   allowedSilentEvents.includes(inputs.notification_type)
      // ) {
      //   sails.log.debug(`no need to send notification`);
      //   return exits.success();
      // }
    }
    let notify = [];
    const uuid = uuidv1();
    try {
      // await NotificationError.create({
      //   user: user.id,
      //   deviceid: user.device_token || 'no_device_token',
      //   errormessage: JSON.stringify({
      //     title: inputs.title,
      //     body: inputs.body,
      //     silent: inputs.silent,
      //     type: inputs.notification_type,
      //     extra_data: inputs.extra_data,
      //     uuid,
      //   }),
      // });
    } catch (e) {
      sails.log.error("Error ", e);
    }

    notify = await firebasePushNotifications.send(
      user.device_token,
      inputs.title,
      inputs.body,
      inputs.silent,
      {
        notification_type: inputs.notification_type,
        extra_data: inputs.extra_data,
        notification_time: moment().toISOString(),
        id: uuid,
      },      
    );
    sails.log(notify);
    if (_.isArray(notify) && !_.isEmpty(notify)) {
      sails.log(notify);
    }
    // All done.
    return exits.success();
  },
};
