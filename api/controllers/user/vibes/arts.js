module.exports = {
  friendlyName: "Get artss of a vibe",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    vibe_id: {
      type: 'number',
      required:true      
    },
    offset: {
			type: "number",
			defaultsTo: 0,
		  },
		  limit: {
			type: "number",
			defaultsTo: 1000,
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
    sails.log("action user/vibes/arts started");
    try {
      let art_vibes = await Art_vibe.find({
        vibe: inputs.vibe_id,
      })

      if (!art_vibes.length) {
        return exits.ok({
          status: true,
          message: "Arts not found",
          data: [],
        });
      }
      art_vibes = _.map(art_vibes, "art");
      let where = {}
      where.deletedAt = null
      where.artist_id = {"!=":inputs.user.id}
      where.type = global.ART_TYPE.DEFAULT
      where.id = art_vibes
				
      data = await Art.searchArts(where, inputs.offset, inputs.limit)
      if (!data.length) {
        return exits.ok({
          status: true,
          message: "Arts not found",
          data: [],
        });
      }
      sails.log("action user/vibes/arts ended");
      return exits.success({
        status: true,
        message: "Arts found successfully",
        data,
      });
    } catch (err) {
      sails.log.error(`Error in action user/vibes/arts. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user vibes"
      );
    }
  },
};
