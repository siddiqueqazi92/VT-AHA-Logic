const jwt = require('jsonwebtoken');
// const uuidv1 = require('uuid/v1');
const { v1: uuidv1 } = require('uuid');

const jwtToken = {
  access_token: sails.config.JWT.ACCESS_TOKEN,
  refresh_token: sails.config.JWT.REFRESH_TOKEN
};
function generatePayload(data) {
  return {
    id: data.id,
    phone: data.phone,
    name: data.firstName + ' ' + data.lastName,
    unique_id: uuidv1()
    // TODO add vehicleSize
  };
}

module.exports = {

  friendlyName: 'Generate token',

  description: 'To generate JWT token',

  inputs: {
    user: {
      type: 'ref'
    },
    needRefreshToken: {
      type: 'boolean',
      defaultsTo: true
    }
  },

  exits: {

    success: {
      description: 'All done.',
    },
    refreshTokenNotSaved: {
      description: 'Refresh token is not saved to db.'
    },
    JwtTokenError: {
      description: 'JWT token is not generated.'
    }

  },

  fn: async function({ user, needRefreshToken }, exits) {
    sails.log.debug('Generating jwt token.');

    const payload = generatePayload(user);
    try {
      const accessToken = await sails.helpers.jwt.accessToken.with({payload});
      let refreshToken;
      if (needRefreshToken) {
        refreshToken = jwt.sign(payload, jwtToken.refresh_token);

        try {
          await Token.create({ token: refreshToken, user_id: user.id });
        } catch (err) {
          sails.log.error('Error saving refresh token', err);
          return exits.refreshTokenNotSaved();
        }
        user.refresh_token = refreshToken;
      }

      user.access_token = accessToken;

      sails.log.debug('Token generated successfully.');
      return exits.success(user);
    } catch (err) {
      sails.log.error('Error generating jwt Token', err);
      return exits.JwtTokenError();
    }
  }

};

