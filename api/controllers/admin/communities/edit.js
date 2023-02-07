module.exports = {
  friendlyName: "Edit community",

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
  },

  fn: async function (inputs, exits) {
    sails.log("action admin/communities/edit started");

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
      let updated = await Community.updateOne({ id: inputs.id }).set(obj);
      sails.log("action admin/communities/edit ended");
      return exits.success({
        status: true,
        message: "Community updated successfully",
        data: updated,
      });
    } catch (err) {
      sails.log.error(`Error in action admin/communities/edit. ${err}`);
      return exits.invalid(err.message || "Server error: can not update vibe");
    }
  },
};
