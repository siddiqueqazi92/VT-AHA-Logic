const moment = require('moment')

module.exports = {


  friendlyName: 'Sign url',


  description: '',


  inputs: {
    folder: {
      type: 'string',
      defaultsTo: ''
    },
    number_of_url: {
      type: 'ref',      
    }
  },

  exits: {

  },


  fn: async function ({ folder,number_of_url }, exits) {
    sails.log.debug('calling action aws/sign-url with optional Data(number_of_url): ', number_of_url, '\nTime: ', moment().format());
    try {
      data = []
     
      for (obj of number_of_url) {
        data.push(await sails.helpers.aws.sign.with({
          folder,
          type:obj.type
        }));
      }
      
      if (!data.length) { throw new Error('Error while generating URL at helper/aws/sign') }
      sails.log.debug('action aws/sign-url executed succesfully and provided url: ', data, '\nTime: ', moment().format());
      return exits.success({
        status: true,
        data: data,
        message: "URL provided successfully"
      });
    } catch (e) {
      sails.log.debug('action aws/sign-url encounered with an Error: ', e, '\nTime: ', moment().format());
      return exits.success({
        status: false,
        data: {},
        message: "Unknown Server Error"
      });
    }
  }


};
