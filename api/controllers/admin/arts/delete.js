const moment = require("moment");
module.exports = {
  friendlyName: "delete art",

  description: "",

  inputs: {
    // admin: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    id: {
      type: "number",
      required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
    ok: {
      responseType: "ok",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action admin/arts/delete started");

    try {
      await Art.updateOne({ id: inputs.id }).set({
        deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      sails.log("action admin/arts/delete ended");
      return exits.success({
        status: true,
        message: "art deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action admin/arts/delete. ${err}`);
      return exits.ok(err.message || "Server error: can not update art");
    }
  },
};
