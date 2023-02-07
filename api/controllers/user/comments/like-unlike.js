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
    liked: {
      type: "boolean",
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
    sails.log("action user/comments/like-unlike started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      obj.user_id = obj.user.id;
      delete obj.user;
      delete obj.liked
      delete obj.id
      let comment = await Comment.findOne({ id: inputs.id });
      if (!comment) {
        return exits.ok({
          status: false,
          message: "Invalid ID",          
        });
      }
      obj.comment = comment.id;
      if (inputs.liked) {
        await Comment_like.updateOrCreate(obj, { ...obj });
        if (comment.user_id != inputs.user.id) {
          await sails.helpers.notifications.sendAndSave(sails.config.notification.type.like_on_comment,{comment,user:inputs.user});  
        }
        
      } else {
        await Comment_like.destroy(obj);
      }
          
      sails.log("action user/comments/like-unlike ended");
      return exits.success({
        status: true,
        message: "Processed successfully",        
      });
    } catch (err) {
      sails.log.error(`Error in action user/comments/like-unlike. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user comment"
      );
    }
  },
};
