

module.exports = {
  friendlyName: "Save card",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },   
    card_id: {
      type: "string",
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
    sails.log("action user/cards/delete started");
    let data = {}
    try {
      let customer_id = inputs.user.customer_id
    
      let deleted = await sails.helpers.stripe.cards.deleteCard(customer_id, inputs.card_id)
      if (!deleted) {
        return exits.ok({
          status: false,
          message: "Unable to delete card",          
        });
      }
      let card = await User_card.findOne({card_id:inputs.card_id})
      await User_card.destroy({ card_id: inputs.card_id })
      if (card.is_selected == true) {
        let remaining = await User_card.count({ user_id: inputs.user.id });
        if (remaining) {
          let first_card_of_user = await User_card.find({
            user_id: inputs.user.id,
          })
            .limit(1)
            .sort("id ASC");
          await User_card.update({ id: first_card_of_user[0].id }).set({
            is_selected: true,
          });
        }
      }
     
      sails.log("action user/cards/delete ended");
      return exits.success({
        status: true,
        message: "Card deleted successfully",        
      });
    } catch (err) {
      sails.log.error(`Error in action user/cards/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user card"
      );
    }
  },
};
