const { generateVideoThumbnail } = require("../../../../util");


module.exports = {


  friendlyName: 'Create',


  description: 'Create forums.',


  inputs: {
    community_id: {
			type: "string",
			required: true,
		},
		title: {
			type: "string",
			required: true,
		},
		description: {
			type: "string",
			required: false,
			allowNull: true,
		},
		media_uri: {
			type: "string",
			required: false,
			allowNull: true,
		},
		media_type: {
			type: "string",
			required: false,
			allowNull: true,
		},
		thumbnail: {
			type: "string",
			required: false,
			allowNull: true,
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
    sails.log("action user/communities/forums/create started");
    try {
      let community = await Community.findOne({ id: inputs.community_id });
      if (!community) {
        return exits.ok({
          status: false,
          message:"Invalid Community ID"
        })
      }
      inputs.community = inputs.community_id
      delete inputs.community_id
      let data = await Community_forum.create(inputs).fetch()
      if (data) {
        data.community_id = data.community
        delete data.community
        if(data.media_type.includes('video')){                             
            try {
              generateVideoThumbnail(data.id, data.media_uri,"community_forum")
            } catch (err) {
              sails.log.error(`Error in generating thumbnail. ${err}`)
            }
          
        }
        return exits.success({
          status: true,
          message: "Created successfully",
          data:data
        })
      }
    } catch (err) {
      sails.log.error(`Error in action user/communities/forums/create. ${err}`);
    }
  }


};
