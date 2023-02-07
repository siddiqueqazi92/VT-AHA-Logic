

module.exports = {


  friendlyName: 'Get community name',


  description: '',


  inputs: {
    artist_id: {
      type:'string'
    },
    name: {
      type:'string'
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Community name',
    },

  },


  fn: async function (inputs, exits) {
    sails.log('Helper get-community-name started')
    let name = null;
    try {
       name = inputs.name
    let where = { artist_id:{"!=":inputs.artist_id} }
  
      let i = 1;
      let exist = null;
    do {
      where.name = name
       exist = await Community.findOne(where)
      if (exist) {
        name = `${inputs.name}${i++}`
      }
    } while (exist);
    
    } catch (err) {
      sails.log.error(`Error in helper get-community-name. ${err}`)
    }
    sails.log('Helper get-community-name ended')
    return exits.success(name)
  }


};

