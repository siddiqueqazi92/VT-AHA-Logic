module.exports = {


  friendlyName: 'Add card',


  description: '',


  inputs: {
    customer_id: {
      type: 'string',
      required:true
    },
    card_id: {
      type: 'string',
      required:true
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    sails.log.debug("Helper stripe/cards/delete started");
		let data = false;
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
      const deleted = await stripe.customers.deleteSource(
        inputs.customer_id,
        inputs.card_id
      );
      
      if (deleted) {
        data = true
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/cards/delete. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

