const { generateVideoThumbnail } = require("../../../../util");


module.exports = {


  friendlyName: 'get',


  description: 'Get forums of a community.',


  inputs: {
    community_id: {
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
    sails.log("action user/communities/forums/get started");
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
      let data = await Community_forum.find({community:inputs.community_id}).skip(inputs.offset).limit(inputs.limit).sort("createdAt DESC")
      if (data.length) {               
        return exits.success({
          status: true,
          message: `${data.length} Record(s) found successfully`,
          data:data
        })
      }
    } catch (err) {
      sails.log.error(`Error in action user/communities/forums/get. ${err}`);
    }
  }


};
