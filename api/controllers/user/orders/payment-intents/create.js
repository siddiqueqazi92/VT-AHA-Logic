module.exports = {
	friendlyName: "Create",

	description: "Create order",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		amount: {
			type: "number",
      required: false,
      defaultsTo:1099
		},
		currency: {
			type: "string",
      required: false,
      defaultsTo:"usd"
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
		sails.log("action user/orders/payment-intents/create started");
		try {
			// Set your secret key. Remember to switch to your live secret key in production.
			// See your keys here: https://dashboard.stripe.com/apikeys
			const stripe = require("stripe")(
				sails.config.stripe.secret_key
			);

			const paymentIntent = await stripe.paymentIntents.create({
				amount: inputs.amount,
				currency: inputs.currency,
      });
      if (paymentIntent.client_secret) {
        const client_secret = paymentIntent.client_secret;
			// Pass the client secret to the client
			sails.log("action user/orders/payment-intents/create ended");
			return exits.success({
				status: true,
				message: "Client secret created successfully",
				data: {client_secret},
			});
      }
      return exits.ok({
				status: false,
				message: "Failed to create client secret",				
      });
      
			
		} catch (err) {
			sails.log.error(
				`Error in action user/orders/payment-intents/create. ${err}`
			);
			return exits.invalid(err.message || "Server error: can not create client secret");
		}
	},
};
