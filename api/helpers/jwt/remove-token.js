module.exports = {

  friendlyName: 'Remove token',

  description: '',

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
    tokenNotFound: {
    }

  },

  fn: async function({token}, exits) {
    sails.log.debug('calling helper/jwt/remove-token ', token);
    const toks = await Token.find({token}).limit(1);
    if (toks.length < 1) {
      return exits.tokenNotFound();
    }
    // const tok = toks[0];
    // const deletedRecords = await Token.destroy({ user_id: tok.user_id });
    const deletedRecords = await Token.destroy({ token });
    sails.log.debug('Deleted records ', deletedRecords);
    return exits.success();
  }
};

