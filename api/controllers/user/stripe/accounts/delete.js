module.exports = {
  friendlyName: "Stripe delete bank account",

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
    sails.log("action user/stripe/accounts/delete started");
  
    try {      
      if (!inputs.user.stripe_account_id) {
        return exits.ok({
          status: false,
          message:"You don't have an account"
        })
      }
      let deleted = await sails.helpers.stripe.accounts.deleteAccount(inputs.user.stripe_account_id);
      if (!deleted) {
        return exits.ok({
          status: false,
          message:'Unable to delete'
        })
      }      
      await User.updateOne({user_id:inputs.user.id}).set({stripe_account_id:null})
      sails.log("action user/stripe/accounts/delete ended");
      return exits.success({
        status: true,
        message: "Account deleted successfully",        
      })
     
    } catch (err) {
      sails.log.error(`Error in action user/stripe/accounts/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not delete user address"
      );
    }
  },
};
