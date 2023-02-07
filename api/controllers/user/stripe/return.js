module.exports = {
  friendlyName: "Stripe return",

  description: "",

  inputs: {
  
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/stripe/return started");
    let req = this.req
    let res = this.res
    try {
            
      sails.log("action user/stripe/return ended");
      let complete = req.complete || false
      sails.log({reqInReturn:req})
      return this.res.view("pages/account-complete", { complete });      
     
    } catch (err) {
      sails.log.error(`Error in action user/addresses/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user address"
      );
    }
  },
};
