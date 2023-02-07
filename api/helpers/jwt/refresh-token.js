const jwt = require('jsonwebtoken');

const jwtToken = {
  access_token: sails.config.JWT.ACCESS_TOKEN,
  refresh_token: sails.config.JWT.REFRESH_TOKEN
};

module.exports = {

  friendlyName: 'Refresh token',

  description: 'To refresh token when expired. provided by refresh token by client',

  inputs: {
    token: {
      type: 'string',
      required: true
    }

  },

  exits: {

    success: {
      description: 'All done.',
    },
    invalid: {
      description: 'invalid token given'
    },
    invalidUser: {
      description: 'invalid user'

    }
  },

  fn: async function({ token: refreshToken, role }, exits) {
    sails.log.debug('calling helpers/jwt/refresh-token');
    const token = await Token.find({ token: refreshToken, role: role }).limit(1);
    if (token.length < 1) {return exits.invalid();}

    jwt.verify(refreshToken, jwtToken.refresh_token, async (err, user) => {
      if (err) {
        sails.log.error('Error verify refresh token ', err);
        return exits.invalid();
      }
      try {
        // await sails.helpers.jwt.removeToken.with({ token: refreshToken });

        dbuser = await User.find({ id: user.id }).limit(1);
        if (dbuser.length < 1) {exits.invalidUser();}
        dbuser = await sails.helpers.jwt.generateToken.with({ user: { ...dbuser[0] }, needRefreshToken: false });

        // const accessToken = await sails.helpers.JWT.REFRESH_TOKEN.with({ payload: user });
        // const newRefreshToken = jwt.sign(user, jwtToken.refresh_token);
        // remove prev refresh token
        return exits.success({ accessToken: dbuser.access_token, refreshToken: refreshToken });
      } catch (e) {
        sails.log.error('Error creating token', e);
        return exits.invalid();
      }
    });
  }

};

