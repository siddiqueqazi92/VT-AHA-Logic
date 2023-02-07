function mergeTwoRandom(arr1, arr2) {

  function extractRandom(arr) {
      var index = Math.floor(Math.random() * arr.length);
      var result = arr[index];
      // remove item from the array
      arr.splice(index, 1);
      return(result);
  }

  var result = [];
  while (arr1.length || arr2.length) {
      if (arr1.length) {
          result.push(extractRandom(arr1));
      }
      if (arr2.length){
          result.push(extractRandom(arr2));
      }
  }
  return(result);
}
module.exports = {
  friendlyName: "Get user communities data",

  description: "Get communities data and events",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
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
    sails.log("action user/communities/data started");
    let data = []
    try {
      communities = await Community.getFollowingCommunitiesDrops({user_id:inputs.user.id,offset:inputs.offset,limit:inputs.limit/2})
      events = await Event.getCommunitiesEvents({offset:inputs.offset,limit:inputs.limit/2})
      data = mergeTwoRandom(communities,events)
      sails.log("action user/communities/data ended");
      return exits.success({
        status: true,
        message: `${data.length} Record(s) found`,
        data,
      });
    } catch (err) {
      sails.log.error(`Error in action user/communities/data. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user communities"
      );
    }
  },
};
