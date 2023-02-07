module.exports = {
  friendlyName: "Save comment",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    parent_id: {
      type: "number",
      required: false,
    },
    art_id: {
      type: "number",
      required: false,
    },
    collection_id: {
      type: "string",
      required: false,
    },
    body: {
      type: "string",
      required: true,
    },
    recipient_id: {
      type: "string",
      required: false,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/comments/create started");

    try {
      let art = await Art.findOne({ where: { id: inputs.art_id }, select: ['artist_id'] })
      if (!art) {
        return exits.success({
          status: false,
          message: "Invalid ID",          
        });
      }
      let obj = { ...inputs };
      sails.log(obj);
      obj.user_id = obj.user.id;
      delete obj.user;
     
      let created = await Comment.create(obj).fetch()
      if (art.artist_id != inputs.user.id) {
        await sails.helpers.notifications.sendAndSave(sails.config.notification.type.comment_on_art,{art_id:inputs.art_id,user:inputs.user});   
      }
     
      let comments =await Comment.getComments(inputs.user,{id:created.id},0,1);
      sails.log("action user/comments/create ended");
      return exits.success({
        status: true,
        message: "Comment saved successfully",
        data: comments[0],
      });
    } catch (err) {
      sails.log.error(`Error in action user/comments/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user comment"
      );
    }
  },
};
