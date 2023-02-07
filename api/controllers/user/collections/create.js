module.exports = {
  friendlyName: "Create collection",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    title: {
      type: "string",
      required: true,
    },
    image: {
      type: "string",
      required: false,
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
    sails.log("action user/collections/create started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      obj.user_id = obj.user.id;
      delete obj.user;

      let title_exist = await User_collection.count({
        user_id: obj.user_id,
        title: obj.title,
      });
      if (title_exist) {
        return exits.ok({
          status: false,
          message: "Collection with same title already exists",
        });
      }
   
      let created = await User_collection.create(obj).fetch();
      if (!created) {
        sails.log("action user/collections/create ended");
        return exits.ok({
          status: false,
          message: "Unable to create collection",          
        });
      }
      created.is_my_collection = true
      sails.log("action user/collections/create ended");
      return exits.success({
        status: true,
        message: "Collection created successfully",
        data: created,
      });
    
    } catch (err) {
      sails.log.error(`Error in action user/collections/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user collection"
      );
    }
  },
};
