module.exports = {
  friendlyName: "Create community",

  description: "",

  inputs: {
    // admin: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    profile_name: {
      type: "string",
      required: true,
    },
    image: {
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
    sails.log("action admin/communities/create started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      //delete obj.admin;

      if (obj.image) {
        is_valid_url = await sails.helpers.isValidUrl(obj.image);
        if (is_valid_url === false) {
          obj.image = await sails.helpers.aws.uploadFile(
            obj.image,
            "communities"
          );
        }
      }
      let created = await Community.create(obj).fetch();
      sails.log("action admin/communities/create ended");
      return exits.success({
        status: true,
        message: "communities created successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action admin/communities/create. ${err}`);
      return exits.ok(
        err.message || "Server error: can not create communities"
      );
    }
  },
};
