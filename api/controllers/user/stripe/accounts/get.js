module.exports = {
  friendlyName: "Stripe create bank account",

  description: "",

  inputs: {
    user: {
      type: "ref",
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
    sails.log("action user/stripe/accounts/get started");
    let data;
    try {   
      sails.log(inputs.user.stripe_account_id)
      if (!inputs.user.stripe_account_id) {
        return exits.ok({
          status: false,
          message:'Account detail not found'
        })
      }      
      let account = await sails.helpers.stripe.accounts.getOne(inputs.user.stripe_account_id);
      let transfer = await sails.helpers.stripe.accounts.transfer(inputs.user.stripe_account_id);
      if (!account || account.charges_enabled == false || account.details_submitted == false || !account.external_accounts.data.length) {
        return exits.ok({
          status: false,
          message:'Account detail not found'
        })
      }      
    
      data = {
        bank_name:account.external_accounts.data[0].bank_name,
        account_holder_name:account.external_accounts.data[0].account_holder_name,
        charges_enabled:account.charges_enabled,
        details_submitted: account.details_submitted,
        account
      }
      sails.log("action user/stripe/accounts/get ended");
      return exits.success({
        status: true,
        message: "Account detail found successfully",
        data
      })
     
    } catch (err) {
      sails.log.error(`Error in action user/stripe/accounts/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user address"
      );
    }
  },
};
