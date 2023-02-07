module.exports = {
  friendlyName: "Create interest",

  description: "",

  inputs: {
    // admin: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    title: {
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
    sails.log("action admin/interests/create started");

    try {
      let obj = { ...inputs };
      obj.title = obj.title.replace(/^\s+|\s+$/gm, "");
      sails.log(obj);
      //delete obj.admin;
      let exist = await Interest.count({ title: obj.title });

      if (exist) {
        return exits.success({
          status: true,
          message: "Title already exist",
          data: { id: null },
        });
      }

      if (obj.image) {
        is_valid_url = await sails.helpers.isValidUrl(obj.image);
        if (is_valid_url === false) {
          obj.image = await sails.helpers.aws.uploadFile(
            obj.image,
            "interests"
          );
        }
      }
      let created = await Interest.create(obj).fetch();
      sails.log("action admin/interests/create ended");
      return exits.success({
        status: true,
        message: "Interest created successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action admin/interests/create. ${err}`);
      return ok.ok(err.message || "Server error: can not create interest");
    }
  },
};
