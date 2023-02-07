const shippo = require('shippo')(sails.config.shippo.api_token);
module.exports = {


  friendlyName: 'Is valid',


  description: '',


  inputs: {
    name: {
      type: "string",
      required: true,
    },
    country: {
      type: "string",
      required: true,
    },
    state: {
      type: "string",
      required: true,
    },
    city: {
      type: "string",
      required: true,
    },
    zip: {
      type: "string",
      required: true,
    },
    street1: {
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
    let data = {is_valid:false}
    try {
      let address  = await shippo.address.create({
        ...inputs
      })
      console.log({ address })
      if (address && address.is_complete === true) {
        let validate = await shippo.address.validate(address.object_id);
        if (validate.validation_results.is_valid === false) {
          data.message = validate.validation_results.messages[0].text
        } else {
          data.is_valid = true
        }
        console.log({validate})
      }          
    } catch (err) {
      sails.log.error(`Error in helper shippo/addresses/is-valid. ${err}`)
    }
    
    return exits.success(data)
  }


};

