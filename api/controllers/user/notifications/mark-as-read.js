module.exports = {


  friendlyName: 'Mark notification as read',


  description: '',


  inputs: {
    user: {
      type: 'ref',
      required: true,
      description: 'logged in user'
    },    
    id: {
      type: 'number',
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    sails.log("action user/notifications/mark-as-read started");
    let updated = await sails.helpers.notifications.markAsRead(inputs.id);
    sails.log("action user/notifications/mark-as-read ended");
    return exits.success({
      status: updated,
    });

  }


};
