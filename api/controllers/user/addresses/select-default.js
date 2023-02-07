module.exports = {
  friendlyName: "Select default address",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
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
  },

  fn: async function (inputs, exits) {
    sails.log("action user/addresses/select-default started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      let address = await User_address.findOne({
        id: inputs.id,
        user_id: inputs.user.id,
      });
      if (!address) {
        return exits.invalid({ status: false, message: "invalid id" });
      }

      obj.is_selected = true;
      delete obj.user;

      let created = await User_address.updateOne({ id: address.id }).set(obj);
      await User_address.update({
        id: { "!=": address.id },
        user_id: inputs.user.id,
      }).set({ is_selected: false });
      sails.log("action user/addresses/select-default ended");
      return exits.success({
        status: true,
        message: "Address selected as default successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action user/addresses/select-default. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not select default user address"
      );
    }
  },
};
