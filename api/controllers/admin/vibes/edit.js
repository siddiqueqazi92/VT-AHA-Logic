module.exports = {
  friendlyName: "Edit vibe",

  description: "",

  inputs: {
    // admin: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    id: {
      type: "number",
      required: true,
    },
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
  },

  fn: async function (inputs, exits) {
    sails.log("action admin/vibes/edit started");

    try {
      let obj = { ...inputs };
      obj.title = obj.title.replace(/^\s+|\s+$/gm, "");
      sails.log(obj);
      //delete obj.admin;
      let exist = await Vibe.count({
        title: obj.title,
        id: { "!=": inputs.id },
      });

      if (exist) {
        return exits.success({
          status: false,
          message: "Title already exist",
        });
      }

      if (obj.image) {
        is_valid_url = await sails.helpers.isValidUrl(obj.image);
        if (is_valid_url === false) {
          obj.image = await sails.helpers.aws.uploadFile(obj.image, "vibes");
        }
      }
      let updated = await Vibe.updateOne({ id: inputs.id }).set(obj);
      sails.log("action admin/vibes/edit ended");
      return exits.success({
        status: true,
        message: "vibe updated successfully",
        data: updated,
      });
    } catch (err) {
      sails.log.error(`Error in action admin/vibes/edit. ${err}`);
      return exits.invalid(err.message || "Server error: can not update vibe");
    }
  },
};
