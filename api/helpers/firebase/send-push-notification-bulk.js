

const firebasePushNotifications = require('../../lib/PushNotifications/firebasePushNotifications');
const moment = require('moment');
// const uuidv1 = require('uuid/v1');
const { v1: uuidv1 } = require('uuid');


module.exports = {
  friendlyName: 'Send push notification',

  description: '',

  inputs: {
    user: {
      type: 'json',
      required: true,
      description: 'Array of user ids',
    },    
    title: {
      type: 'string',
    },

    body: {
      type: 'string',
    },

    silent: {
      type: 'boolean',
      required: true,
    },
    extra_data: {
      type: 'ref',
      required: true,
    },
    notification_type: {
      type: 'string',
      required: true,
    },
  },

  exits: {},

  fn: async (inputs, exits) => {
    
    sails.log.debug('sending bulk push notification: ', { inputs });
    let user = null;
    user = await User.find({
      where:{ user_id: inputs.user },
      select: ['device_token']
     });
    
    const allowedSilentEvents = [];

    sails.log.debug({ thisisuser: user });

    
    // return exits.success();
    if (!user.length) {
      sails.log.debug(
        //`userId: ${user.id} noisy notifications not permitted`
        `userId: noisy notifications not permitted`
      );
            
      sails.log.debug(
        `send-push-notification ${inputs.role}_ids: ${inputs.user}\nTitle: ${inputs.title}\nBody: ${inputs.body}`
      );

      if (!inputs.silent) {
        sails.log.debug(
          `userId:  not sending noisy notification`
        );
        return exits.success();
      }
    }
    let tokens =  user.map(o => o['device_token']);

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
      sails.log.error('Error ', e);
    }



    notify = await firebasePushNotifications.sendBulk(
      tokens,
      inputs.title,
      inputs.body,
      inputs.silent,
      {
        notification_type: inputs.notification_type,
        extra_data: inputs.extra_data,
        notification_time: moment().toISOString(),
        id: uuid,
      },
      inputs.role
    );
    sails.log(notify);
    if (_.isArray(notify) && !_.isEmpty(notify)) {
      sails.log(notify);
    }
    // All done.
    return exits.success();
  },
};
