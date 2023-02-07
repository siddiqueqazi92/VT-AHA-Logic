module.exports = {
  friendlyName: "Delete address",

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
    sails.log("action user/addresses/delete started");

    try {
      let address = await User_address.findOne({
        id: inputs.id,
        user_id: inputs.user.id,
      });
      if (!address) {
        return exits.invalid({ status: false, message: "invalid id" });
      }

      await User_address.destroy({ id: address.id });
      let remaining = await User_address.count({ user_id: inputs.user.id });
      if (remaining) {
        let last_address_of_user = await User_address.find({
          user_id: inputs.user.id,
        })
          .limit(1)
          .sort("id DESC");
        await User_address.update({ id: last_address_of_user[0].id }).set({
          is_selected: true,
        });
      }
      sails.log("action user/addresses/delete ended");
      return exits.success({
        status: true,
        message: "Address deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action user/addresses/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not delete user address"
      );
    }
  },
};
