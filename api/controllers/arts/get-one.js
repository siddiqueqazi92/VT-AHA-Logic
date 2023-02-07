module.exports = {
  friendlyName: "Get one",

  description: "Get art detail",

  inputs: {
    user: {
      type: "ref",
    },
    id: {
      type: "number",
      required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Running arts/get-one.js with inputs " + JSON.stringify(inputs)
    );

    try {
      let user = await User.findOne({
        where: { user_id: inputs.user.id },
        select: ["user_id", "country"],
      });
      
      let arts = await Art.getArts(
        user,
        { id: inputs.id },
        0,
        1
      );
      if (!arts.length) {
        return exits.ok({
          status: false,
          message: "Art not found",
        });
      }
      let art = arts[0]
      if (!art.thumbnail) {
        await sails.helpers.saveThumbnail(art.id, art.resources)
      }
      
      // if (art.template && !_.isEmpty(art.template)) {
      //   parcel_template = sails.config.parcel_templates[art.template.token]
      //   if (parcel_template && !_.isEmpty(parcel_template)) {
      //     art.template = { ...art.template,...parcel_template }
      //   }
      // }
      // if (art.sizes.length) {
      //   for (let s of art.sizes) {
      //     let template = s.template
      //     if (template && !_.isEmpty(template)) {
      //       template = JSON.parse(template)
      //       parcel_template = sails.config.parcel_templates[template.token]
      //       if (parcel_template && !_.isEmpty(parcel_template)) {
      //         template = { ...template,...parcel_template }
      //       }
      //       s.template = template
      //     }
      //   }
      // }
      return exits.success({
        status: true,
        message: "Art Found Successfully",
        data: art,
      });
    } catch (err) {
      sails.log.error("error calling arts/get-one.js", err.message);
      if (
        !_.isUndefined(err.response) &&
        !_.isUndefined(err.response.data) &&
        !_.isUndefined(err.response.status)
      ) {
        let [exitsName, responseData] = await sails.helpers.response.with({
          status: err.response.status,
          data: err.response.data,
        });
        return exits[exitsName](responseData);
      }
      return exits.serverError({
        status: false,
        data: [],
        message: "Unknown server error.",
      });
    }
  },
};
