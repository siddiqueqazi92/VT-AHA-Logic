const shippo = require('shippo')(sails.config.shippo.api_token);

module.exports = {


  friendlyName: 'Get one',


  description: 'Get one carrier account by carrier type.',


  inputs: {
    carrier: {
			type: "string",
			required: true,
		},		
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
	  sails.log("helper shippo/carrier-accounts/get-one started");
	  let data = null;
	  try {	
		  let carrier_accounts = await shippo.carrieraccount.list();
		  if (carrier_accounts.results.length) {
			data =  _.find(carrier_accounts.results,{carrier:inputs.carrier})
		  }
		} catch (err) {
			sails.log.error(`Error in helper shippo/carrier-accounts/get-one. ${err}`);			
	}
	  
	return exits.success(data);
  }


};

