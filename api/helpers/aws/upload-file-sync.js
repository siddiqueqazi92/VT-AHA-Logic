const AWS = require("aws-sdk");

if (typeof atob === "undefined") {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, "base64").toString("binary");
  };
}

module.exports = {
  friendlyName: "Upload file to aws bucket",

  description: "",
  sync:true,
  inputs: {
    base64String: {
      type: "string",
      required: true,
    },
    folder: {
      type: "string",
      required: true,
    },
    file_type: {
      type: "string",
      required: false,
      defaultsTo: "png",
    },
  },

  exits: {},

  fn: function (inputs, exits) {
  //   console.log("folder:", inputs.folder);

  //   var s3Bucket = new AWS.S3({ params: { Bucket: sails.config.aws.bucket } });

  //   buf = Buffer.from(
  //     inputs.base64String.replace(/^data:image\/\w+;base64,/, ""),
  //     "base64"
  //   );
  //   var key = await sails.helpers.generateRandomString();

  //   let file_type = inputs.file_type;
  //   let content_type = "image/png";
  //   let base64String = inputs.base64String;
  //   switch (true) {
  //     case base64String.includes("image/png"): {
  //       content_type = "image/png";
  //       file_type = "png";
  //       break;
  //     }
  //     case base64String.includes("image/jpeg"): {
  //       content_type = "image/jpeg";
  //       file_type = "jpeg";
  //       break;
  //     }
  //     case base64String.includes("application/pdf"): {
  //       content_type = "application/pdf";
  //       file_type = "pdf";
  //       break;
  //     }
  //     case base64String.includes("application/msword"): {
  //       content_type = "application/msword";
  //       file_type = "doc";
  //       break;
  //     }
  //     case base64String.includes("video/mp4"): {
  //       content_type = "video/mp4";
  //       file_type = "mp4";
  //       break;
  //     }
  //   }
  //   // if (inputs.file_type) {
  //   //   file_type = inputs.file_type;
  //   //   switch (inputs.file_type.toLowerCase()) {
  //   //     case "pdf": {
  //   //       content_type = "application/pdf";
  //   //       break;
  //   //     }
  //   //     case "doc": {
  //   //       content_type = "application/msword";
  //   //       break;
  //   //     }
  //   //     default: {
  //   //       content_type = "image/jpeg";
  //   //     }
  //   //   }
  //   // }
  //   inputs.folder = "original";
  //   //key = inputs.folder + "/" + key + "." + file_type;
  //   key = key + "." + file_type;
  //   var params = {
  //     Key: key,
  //     Body: buf,
  //     ContentEncoding: "base64",
  //     ContentType: content_type,
  //     ACL: "public-read",
  //   };

  //   s3Bucket.upload(params, function (err, data) {
  //     if (err) {
  //       sails.log.error("Error uploading data: ", params);
  //     }
  //     sails.log(`File uploaded successfully. File path: ${data.Location}`);
  //     // imagePath = data.Location;
  //     return exits.success(data.Location);
  //   });
   },
};
