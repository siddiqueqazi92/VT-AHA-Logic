
const express = require('express')
module.exports = {


  friendlyName: 'Webhook',


  description: '',


  inputs: {
   
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    express.raw({ type: 'application/json' })    
    let request = this.req
    let response = this.res
    try {
      const event = request.body;
    let subscription;
      let status;
      let customer_email
      let customer_id
    // Handle the event
      console.log(event.data.object)
    switch (event.type) {      
      case 'charge.succeeded':
        subscription = event.data.object;
           
        break;    
      case 'transfer.created':
        subscription = event.data.object;
           
        break;    
      case 'payment_method.attached':
        obj = event.data.object;
        break;     
      case 'customer.source.created':
        obj = event.data.object;
        break;     
      case 'customer.updated':
        obj = event.data.object;
        break;     
      case 'customer.updated':
        obj = event.data.object;
        break;     
      case 'setup_intent.created':
        obj = event.data.object;
        break;     
      case 'source.chargeable':
        obj = event.data.object;
        break;     
      case 'payment_intent.created':
        obj = event.data.object;
        break;     
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
      return exits.success();
    } catch (err) {
      sails.log.error(`Error in action stripe/webhook. ${err}`)
    }
    return exits.success({status:true,session:null})
    

  }


};
