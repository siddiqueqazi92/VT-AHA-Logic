module.exports = {
  friendlyName: "Generate random",

  description: "",

  inputs: {
    size: {
      type: "number",
      required: false,
      defaultsTo: 10,
    },
    characters: {
      type: "string",
      required: false,
      defaultsTo:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: function (inputs, exits) {
    sails.log("calling helpers/generate-random-string");
    var length = inputs.size;
    var result = "";
    var characters = inputs.characters;
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return exits.success(result);
  },
};
