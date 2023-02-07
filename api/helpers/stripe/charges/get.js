module.exports = {
	friendlyName: "Get charges",

	description: "",

  inputs: {
    customer_id: {
      type: 'string',
      required:true
    },    
  },

	exits: {
		success: {
			description: "All done.",
		},
	},

  fn: async function (inputs, exits) {
    sails.log.debug('Helper stripe/charges/get started')
    let data = {}
		try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);
      let input_obj = { limit: 10 }
      if (inputs.customer_id) {
        input_obj.customer = inputs.customer_id
      }
      const charges = await stripe.charges.list(input_obj);
      if (charges.data) {
        data.charges = charges.data
      }
      return exits.success(data)
		
    } catch (err) {
      sails.log.error(`Error in helper stripe/charges/create. ${err}`)
      return exits.success(data)
    }    
	},
};
