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
    sails.log("action user/stripe/accounts/create started");
  
    try {
      let metadata = {user_id:inputs.user.id}
      let data = await sails.helpers.stripe.accounts.create(metadata);
      if (_.isEmpty(data) || !data.account_link) {
        return exits.ok({
          status: false,
          message:'Unable to process'
        })
      }
      let statuses = await sails.helpers.statuses.get([global.STATUS.PENDING]);	
      await User.updateOne({user_id:inputs.user.id}).set({stripe_account_id:data.account.id})
      await Withdrawal_request.update({user_id:inputs.user.id}).set({stripe_account_id:data.account.id})
      sails.log("action user/stripe/accounts/create ended");
      return exits.success({
        status: true,
        message: "Url generated successfully",
        data:{url:data.account_link.url}
      })
     
    } catch (err) {
      sails.log.error(`Error in action user/stripe/accounts/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user address"
      );
    }
  },
};
