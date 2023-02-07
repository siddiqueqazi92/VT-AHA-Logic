module.exports = {
  friendlyName: "Delete comment",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    id: {
      type: "number",
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
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/comments/delete started");

    try {     
      let comment = await Comment.findOne({ id: inputs.id, user_id: inputs.user.id });
      if (!comment) {
        return exits.ok({
          status: false,
          message: "Invalid ID",          
        });
      }
       await Comment.destroy({id:inputs.id})      
      sails.log("action user/comments/delete ended");
      return exits.success({
        status: true,
        message: "Comment deleted successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action user/comments/delete. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user comment"
      );
    }
  },
};
