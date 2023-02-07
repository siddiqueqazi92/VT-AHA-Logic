module.exports = {
  friendlyName: "delete interest",

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
    sails.log("action admin/interests/delete started");

    try {
      await Interest.destroy({ id: inputs.id });
      await User_interest.destroy({ interest: inputs.id });
      sails.log("action admin/interests/delete ended");
      return exits.success({
        status: true,
        message: "Interest deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action admin/interests/delete. ${err}`);
      return exits.ok(err.message || "Server error: can not update interest");
    }
  },
};
