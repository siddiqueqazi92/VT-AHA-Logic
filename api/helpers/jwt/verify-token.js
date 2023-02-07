const jwt = require('jsonwebtoken');

const jwtToken = {
  access_token: sails.config.JWT.ACCESS_TOKEN,
  refresh_token: sails.config.JWT.REFRESH_TOKEN
};
module.exports = {

  friendlyName: 'Verify token',

  description: '',

  inputs: {
    token:{
      type: 'string',
      required: true
    }
  },

  exits: {

    success: {
      description: 'All done.',
    },    

  },

  fn: async function({token}, exits) {
    sails.log.debug('calling helper/jwt/verify');

    try {
      const user = await checkJwt(token);
      // sails.log({user});
      return exits.success(user);
    } catch (e) {
      // return exits.unauthorized();
      return exits.success(false)
      
    }
  }

};

function checkJwt(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtToken.access_token, async (err, user) => {
      if (err) {
        sails.log.error({ policyError: err.message || 'jwt expired' });
        reject(err);
      }
      resolve(user);
    });
  });
}