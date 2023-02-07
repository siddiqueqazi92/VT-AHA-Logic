module.exports = {
  friendlyName: "Select default card",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    id: {
      type: "string",
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
    sails.log("action user/cards/select-default started");

    try {
      let obj = { ...inputs };
      obj.card_id = obj.id
      delete obj.id
      sails.log(obj);
      let card = await User_card.findOne({
        card_id: obj.card_id,
        user_id: inputs.user.id,
      });
      if (!card) {
        return exits.invalid({ status: false, message: "Invalid id" });
      }

      obj.is_selected = true;
      delete obj.user;

      let created = await User_card.updateOne({ card_id: card.card_id, user_id: inputs.user.id }).set(obj);
      created.id = created.card_id
      delete created.card_id
      await User_card.update({
        card_id: { "!=": created.id },
        user_id: inputs.user.id,
      }).set({ is_selected: false });
      sails.log("action user/cards/select-default ended");
      return exits.success({
        status: true,
        message: "Card selected as default successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action user/cards/select-default. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not select default user card"
      );
    }
  },
};
