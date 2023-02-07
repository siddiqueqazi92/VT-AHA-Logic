module.exports = {
  friendlyName: "Attach country",

  description: "",

  inputs: {
    user_id: {
      type: "string",
      required: true,
    },
    dial_code: {
      type: "string",
      required: true,
    },

    country_code: {
      type: "string",
      required: false,
      allowNull: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("calling helper general/attach-country");
    const user_id = inputs.user_id;
    const dial_code = inputs.dial_code;

    let updated = null;
    let country = null;
    try {
      country = await Country.find({ dial_code: dial_code }).sort('id DESC');
      //   }
      sails.log(`user_id: ${user_id}`);
      if (country.length) {
        country = country[0]
        sails.log(`country found with id ${country.id}`);
        await User.update({ user_id }).set({ country: country.en });
        updated = country.en;
      }
    } catch (err) {
      sails.log.error(`Error in helper attach-country. ${err}`)
    }
   
    return exits.success(updated);
  },
};
