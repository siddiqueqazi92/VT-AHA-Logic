/**
 * Art_support.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "art_supports",
  attributes: {     
    art: {
      model: "art",
      columnName:'art_id'
    },
    user_id: {
			type: "string",
      required: true,      
    },
    amount: {
      type: 'number',
      required:true
    },
    card: {
			type: "string",
		},
  },

};

