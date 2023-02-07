module.exports = {
	friendlyName: "Transfer amount to connected account",

	description: "",

	inputs: {
		stripe_account_id: {
			type: 'string',
			required:true
		},
		transfer_amount: {
			type: 'number',
			defaultsTo:100
		}
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/accounts/transfer started");
		let data = {status:false,message:null};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
						
			const transfer = await stripe.transfers.create({
				amount: inputs.transfer_amount*100,
				currency: 'usd',
				destination: inputs.stripe_account_id,
				transfer_group: '{ORDER10}',
				// source_transaction: 'ch_3L3wuTDM6P2npzvm2kXWBxWt',
			});
			data.status = true;
			data.message = "Amount transfered successfully"
			return exits.success(data);
		} catch (err) {
			sails.log.error(`Error in helper stripe/accounts/transfer. ${err}`);
			err.message = err.message.split('.')[0]
			data.message = err.message
			
		}
		return exits.success(data);
	},
};
