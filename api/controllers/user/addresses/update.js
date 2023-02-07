module.exports = {
  friendlyName: "Update address",

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
    sails.log("action user/addresses/update started");

    try {
      let obj = { ...inputs };
      sails.log(obj);
      let address = await User_address.findOne({
        id: inputs.id,
        user_id: inputs.user.id,
      });
      if (!address) {
        return exits.invalid({ status: false, message: "invalid id" });
      }
      let is_valid_address = await sails.helpers.shippo.addresses.isValid(inputs.title, inputs.country, inputs.state, inputs.city, inputs.zip, inputs.street)
      if (is_valid_address.is_valid === false) {
        return exits.ok({
          status: false,
          message: is_valid_address.message,          
        });
      }
      obj.user_id = obj.user.id;
      delete obj.user;

      if (obj.country.toLowerCase() == 'united states') {
        obj.country = 'US'
      }
      let created = await User_address.updateOne({ id: address.id }).set(obj);
      created.address = created.street
      sails.log("action user/addresses/update ended");
      return exits.success({
        status: true,
        message: "Address updated successfully",
        data: created,
      });
    } catch (err) {
      sails.log.error(`Error in action user/addresses/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not create user address"
      );
    }
  },
};
