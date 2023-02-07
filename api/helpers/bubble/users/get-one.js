const axios = require("axios");

module.exports = {


  friendlyName: 'Get one',


  description: 'Get bubble user.',


  inputs: {
    id: {
      type: 'string',
      required:true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let data = { _id:inputs.id }
    try {          
     
      let url = `${sails.config.bubble.url}/api/1.1/obj/user/${inputs.id}`
      console.log(url)
      axios.defaults.headers.common = {'Authorization': `bearer ${sails.config.bubble.api_token}`}
        let response = await axios.get(url);
      if (!(_.isUndefined(response.data) && _.isUndefined(response.data.response) && _.isUndefined(response.data.response))) {
        data = response.data.response
        
      }     
      
    } catch (err) {
      sails.log.error(`Error in helper bubble/users/get-one.js. ${err}`)
    }
    return exits.success(data)
  }


};

