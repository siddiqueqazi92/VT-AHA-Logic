module.exports = {
  friendlyName: "Ping",

  description: "Ping something.",

  inputs: {},

  exits: {},

  fn: async function (inputs, exits) {
    return exits.success('api/logic');
  },
};
