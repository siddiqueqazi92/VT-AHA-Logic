
module.exports = {
  friendlyName: "Delete bubble event",

  description: "Delete bubble event",

  inputs: {
    _id: {
      type: "string",
      required: true,
    },          
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log(`action bubble/events/delete started. Inputs: ${JSON.stringify(inputs)}`);    
    try {
     console.log({_id:inputs._id})
      let exist = await Event.count({ _id: inputs._id })
      if (exist) {
        await Event.destroy({_id:inputs._id})
      }
      
      sails.log("action bubble/events/delete ended");
      return exits.success({
        status: true,
        message: "Event delete successfully",           
      });
    } catch (err) {
      sails.log.error(`Error in action bubble/events/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not delete user"
      );
    }
  },
};
