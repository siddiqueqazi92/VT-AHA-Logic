const { generateVideoThumbnail } = require("../util");



module.exports = {


  friendlyName: 'Save thumbnail',


  description: '',

  //sync:true,
  inputs: {
    art_id: {
      type: 'number',
      required:true
    },
    resources: {
      type: 'ref',
      required:true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Thumbnail',
    },

  },


  fn: async function (inputs, exits) {
    sails.log("Helper save-thumbnail started")
    try {
      let art_id = inputs.art_id
      let resources = inputs.resources;
      let image =  _.find(resources, function(o) {
       return o.type.includes('image')
      });
      if (image) {
        Art.updateOne({ id: art_id }).set({ thumbnail: image.uri }).then(() => {
          sails.log(`Thumbnail saved for Art ID: ${art_id}`)
        })
      } else {
        let video =  _.find(resources, function(o) {
          return o.type.includes('video')
        });
        if (video) {
        //try { sails.helpers.generateThumbnail(art_id, video.uri) }catch(err){sails.log.error(`Error in generating thumbnail. ${err}`)}
          try {
            generateVideoThumbnail(art_id, video.uri,"art")
          } catch (err) {
            sails.log.error(`Error in generating thumbnail. ${err}`)
          }
        }
      }
    } catch (err) {
      sails.log.error(`Error in helper save-thumbnail. ${err}`)
    }
    sails.log("Helper save-tthumbnail ended")
    return exits.success()
  }


};

