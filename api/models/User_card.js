/**
 * User_card.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "user_cards",
  attributes: {
    createdAt: false,
    updatedAt: false,
    user_id: {
      type: "string",
      required: true,      
    },
    card_id: {
      type: "string",
      required: true,      
    },
    is_selected: {
      type: "boolean",
      defaultsTo: false,
    },
    brand: {
      type: "string",
      required: true,
    },
    country: {
      type: "string",
      required: false,
    },
    exp_month: {
      type: "number",
      required: true,
    },
    exp_year: {
      type: "number",
      required: true,
    },
    last4: {
      type: "string",
      required: true,
    },
  },
  createOrUpdateCard: async function (where,obj) {   
    try {
      if (where.user_id && _.isUndefined(obj.is_selected)) {
        let card_count = await User_card.count({ user_id: where.user_id });
        if (!card_count) {
          obj.is_selected = true
        }
      }
      await User_card.updateOrCreate(where, obj);
      return true
    } catch (err) {
      sails.log.error(`Error in model Community, function createOrUpdateCommunity. ${err}`)
      return false
    }
   
  },
};
