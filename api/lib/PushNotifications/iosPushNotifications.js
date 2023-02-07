var PushNotifications = require('node-pushnotifications');

var senderPush = (() => {
  const settings = {
    apn: {
      token: {
        key: sails.config.apn.sender.token_key,
        keyId: sails.config.apn.sender.token_key_id,
        teamId: sails.config.apn.sender.token_team_id,
        production: true // needs to be true to send to TestFlight & live builds from server
      }
    }
  };
  sails.log.info('Sender PushNotifications created!!!');
  return new PushNotifications(settings);
})();

module.exports = {
  send: async (deviceId, title, body, silent, data, app = 'sender') => {
    let topic;
    if (app === 'sender') {
      topic = 'io.kiffgo.kiffgo';
    } else if (app === 'driver') {
      topic = 'com.kiffgo.driver';
    }

    // Single destination
    const registrationIds = deviceId;

    if (silent) {
      Object.assign(data, { silent: silent.toString() });
    } else {
      Object.assign(data, { title, body, silent: silent.toString() });
    }

    let notificationData = {};
    if (silent) {
      notificationData = {
        topic: topic,
        contentAvailable: true,
        priority: 'normal',
        alert: data
      };
    } else {
      notificationData = {
        title: title,
        topic: topic, // REQUIRED for iOS
        body: body,
        custom: {
          ...data // <----- this is important because firebase only gets access to data put here
        },
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
        collapseKey: '', // gcm for android, used as collapseId in apn
        contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
        bodyLocArgs: '', // gcm, apn
        titleLocKey: '', // gcm, apn
        titleLocArgs: '', // gcm, apn
        retries: 1, // gcm, apn
        encoding: '', // apn
        badge: 1, // gcm for ios, apn
        sound: 'ping.aiff', // gcm, apn
        alert: {
          // apn, will take precedence over title and body
          title: title,
          body: body,
          ...data // <--------------- this is important because PushNotificationsIOS only gets access to data put here
          // details: https://github.com/node-apn/node-apn/blob/master/doc/notification.markdown#convenience-setters
        },
        // alert: '', // A string is also accepted as a payload for alert
        // Your notification won't appear on ios if alert is empty object
        // If alert is an empty string the regular 'title' and 'body' will show in Notification
        titleLocKey: '', // apn and gcm for ios
        titleLocArgs: '', // apn and gcm for ios
        launchImage: '', // apn and gcm for ios
        action: '', // apn and gcm for ios
        category: '', // apn and gcm for ios
        // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
        // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
        urlArgs: '', // apn and gcm for ios
        truncateAtWordEnd: true, // apn and gcm for ios
        mutableContent: 0, // apn
        threadId: '', // apn
        expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // seconds
        timeToLive: 28 * 86400 // if both expiry and timeToLive are given, expiry will take precedency
      };
    }

    try {
      var results = await senderPush.send(registrationIds, notificationData);
      // sails.log.debug(
      //   'Sender Push notifications results[0].message: ',
      //   results[0].message
      // );
      // sails.log.debug(
      //   'Sender Push notifications results: ',
      //   JSON.stringify(results)
      // );
      // sails.log.debug('sender obj', [
      //   { deviceId, title, body, silent, data, app }
      // ]);
      return results;
    } catch (err) {
      sails.log.error('senderPush.send returned err: ', err);
    }
  }
};
