module.exports = {


  friendlyName: 'Delete file from aws bucket',


  description: '',


  inputs: {
    file_name: {
      type: 'string',
      required: true
    },
    folder: {
      type: 'string',
      required: false
    }
  },


  exits: {

  },


  fn: async function(inputs, exits) {
    //console.log("folder:",inputs.folder);
    
    var AWS = require('aws-sdk');
    var s3Bucket = new AWS.S3( { params: {Bucket: sails.config.aws.bucket} } );
  
    var key = inputs.file_name;
    if(inputs.folder)
    {
        key = inputs.folder+"/"+key;
    }
    var params = {
      Key: inputs.file_name    
    };
   
    s3Bucket.deleteObject(params, function(err, data) {
        if (err) return exits.success(err);  // error
        else     return exits.success(true);                 // deleted
      });
    
  }

};

