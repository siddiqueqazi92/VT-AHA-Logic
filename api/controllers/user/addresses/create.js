
module.exports = {
  friendlyName: "Save address",

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
    country: {
      type: "string",
      required: true,
    },
    state: {
      type: "string",
      required: true,
    },
    city: {
      type: "string",
      required: true,
    },
    zip: {
      type: "string",
      required: true,
    },
    street: {
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
    sails.log("action user/addresses/create started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      obj.user_id = obj.user.id;
      delete obj.user;
      let is_valid_address = await sails.helpers.shippo.addresses.isValid(inputs.title, inputs.country, inputs.state, inputs.city, inputs.zip, inputs.street)
      if (is_valid_address.is_valid === false) {
        return exits.ok({
          status: false,
          message: is_valid_address.message || 'Invalid address',          
        });
      }
      let existing_addresses = await User_address.count({
        user_id: inputs.user.id,
      });
      if (!existing_addresses) {
        obj.is_selected = true;
        obj.is_picking_point = true;
      }
      if (obj.country.toLowerCase() == 'united states') {
        obj.country = 'US'
      }
      let created = await User_address.create(obj).fetch();
      created.address = created.street
      sails.log("action user/addresses/create ended");
      return exits.success({
        status: true,
        message: "Address saved successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action user/addresses/create. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user address"
      );
    }
  },
};
