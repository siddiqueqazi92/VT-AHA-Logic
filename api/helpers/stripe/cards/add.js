module.exports = {


  friendlyName: 'Add card',


  description: '',


  inputs: {
    customer_id: {
      type: 'string',
      required:true
    },
    token: {
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
    sails.log.debug("Helper stripe/cards/add started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
      // const token_response = await sails.helpers.stripe.tokens.create(inputs.token)
      // if (!token_response.token) {
      //   return exits.success(data)
      // }
      // let token = token_response.token.id
      token = inputs.token
      const card = await stripe.customers.createSource(
        inputs.customer_id,
        {source: token}
        // {source: token_response.token.id}
      );
      if (card) {
        data.card = card
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/cards/add. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

