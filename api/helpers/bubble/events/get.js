const axios = require("axios");

module.exports = {


  friendlyName: 'Get',


  description: 'Get events.',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    try {          
      let cursor = await Setting.getValue('bubble_api_cursor') || 0      
      sails.log(cursor)
      let remaining = 0
      let url = `${sails.config.bubble.url}/api/1.1/obj/event?cursor=${cursor}`
      do {
        let response = await axios.get(url);
      if (!(_.isUndefined(response.data) && _.isUndefined(response.data.response) && _.isUndefined(response.data.response.results))) {
        let results = response.data.response.results
        remaining = response.data.response.remaining
        sails.log(results)
        if (results.length) {
          cursor = results.length+cursor
          await Event.createEvents(results)
        }
      }
      }while(remaining > 0)
      await Setting.updateOrCreate({key:'bubble_api_cursor'}, {
        key: 'bubble_api_cursor',
        value:cursor
      });
      return exits.success()
    } catch (err) {
      sails.log.error(`Error in helper bubble/events/get.js. ${err}`)
    }
  }


};

