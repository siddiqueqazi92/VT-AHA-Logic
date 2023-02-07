module.exports = {


  friendlyName: 'Get cards',


  description: '',


  inputs: {
    customer_id: {
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
    sails.log.debug("Helper stripe/cards/get started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);

      const cards = await stripe.customers.listSources(
        inputs.customer_id,
        {object: 'card'}
      );
      if (cards.data.length) {
        data.cards = cards.data
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/cards/get. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

