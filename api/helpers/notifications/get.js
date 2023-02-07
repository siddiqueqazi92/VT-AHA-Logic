

module.exports = {
  friendlyName: "Get",

  description: "Get notifications",

  inputs: {
    user_id: {
      type: "string",
      required: true,
    }, 
    offset: {
      type: 'number',
      defaultsTo:0
    },
    limit: {
      type: 'number',
      defaultsTo:1000
    }
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log("helper notifications/get started");    
    let data = []
    try {
      data = await User_notification.find({
        where: { user_id: inputs.user_id },
        select:['id','user_id','title','body','extra_data','notification_type','is_read','createdAt']
      }).skip(inputs.offset).limit(inputs.limit).sort([
        // { is_read: 'ASC' },
        { createdAt: 'DESC' },
      ]);
      if (!data.length) {
        return exits.success([]);
      }
      extra_datas = _.map(data, "extra_data")
      user_ids = []
      for (ed of extra_datas) {
        ed = JSON.parse(ed)
        user_ids.push(ed.user.id)
      }
      let users = await User.find({where:{user_id:user_ids},select:["user_id","profile_image","username"]})
      for (notification of data) {
        if (notification.extra_data) {
          let ed = JSON.parse(notification.extra_data)
          let user = _.find(users, { user_id: ed.user.id })
          if (user) {
            ed.user.username = user.username
            ed.user.profile_image = user.profile_image
             notification.extra_data = JSON.stringify(ed)
          }
         
          notification.date = notification.createdAt
          delete notification.createdAt
        }
      }
      // await User_notification.update({id:_.map(data,"id")}).set({is_read:true})
      await User_notification.update({user_id:inputs.user_id}).set({is_read:true})
      sails.log("helper notifications/get ended");
     
    } catch (err) {
      sails.log.error(`Error in helper notifications/get. ${err}`);     
    }
    return exits.success(data);
  },
};
