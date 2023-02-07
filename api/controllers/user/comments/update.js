module.exports = {
  friendlyName: "Update comment",

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
    body: {
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
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/comments/update started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      obj.user_id = obj.user.id;
      delete obj.user;
      let comment = await Comment.findOne({ id: inputs.id, user_id: obj.user_id });
      if (!comment) {
        return exits.ok({
          status: false,
          message: "Invalid ID",          
        });
      }
      let updated = await Comment.updateOne({id:inputs.id}).set(obj);
      let comments =await Comment.getComments(inputs.user,{id:updated.id},0,1);
      sails.log("action user/comments/update ended");
      return exits.success({
        status: true,
        message: "Comment Updated successfully",
        data: comments[0],
      });
    } catch (err) {
      sails.log.error(`Error in action user/comments/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user comment"
      );
    }
  },
};
