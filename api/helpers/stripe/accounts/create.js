module.exports = {
	friendlyName: "Create account",

	description: "",

	inputs: {
		metadata: {
			type: 'ref',
			required:true
		}
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/accounts/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			// let obj = {type: 'express'};
			let obj = {
				// country: 'US',
				type: 'express',
				capabilities: {		
					// card_payments: {requested: true},
					transfers: { requested: true },					
				},
				business_type: 'individual',
				business_profile: { url: 'https://google.com' },
				metadata: inputs.metadata,
				// tos_acceptance: {service_agreement: 'recipient'},
			};

			const account = await stripe.accounts.create(obj);
			sails.log({stripeResponse:account})
			if (account) {
				data.account = account;
			}
			let account_link = await stripe.accountLinks.create({
				account: account.id,
				refresh_url: "https://example.com/reauth",
				return_url: `${sails.config.app_url.proxy}/user/stripe/return`,
				type: "account_onboarding",
			});		
			if (account_link) {
				data.account_link = account_link
			}
		
		} catch (err) {
			sails.log.error(`Error in helper stripe/accounts/create. ${err}`);			
		}
		sails.log.debug("Helper stripe/accounts/ended started");
		return exits.success(data);
	},
};
