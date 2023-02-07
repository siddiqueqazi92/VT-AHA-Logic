
module.exports = {
  friendlyName: "Update bubble event",

  description: "Update bubble event",

  inputs: {
    _id: {
      type: "string",
      required: false,
    },
    StartDate: {
      type: "string",
      required: false,
      allowNull:true
    },
    Description: {
      type: "string",
      required: false,
      allowNull:true
    },
    Headline: {
      type: "string",
      required: false,
      allowNull:true
    },
    Name: {
      type: "string",
      required: false,
      allowNull:true
    },
    Summary: {
      type: "string",
      required: false,
      allowNull:true
    },
    StartTime: {
      type: "string",
      required: false,
      allowNull:true
    },
    EndTime: {
      type: "string",
      required: false,
      allowNull:true
    },
    CreatedDate: {
      type: "string",
      required: false,
      allowNull:true
    },
    Slug: {
      type: "string",
      required: false,
      allowNull:true
    },
    CreatedBy: {
      type: "string",
      required: false,
      allowNull:true
    },
    ModifiedDate: {
      type: "string",
      required: false,
      allowNull:true
    },
    Address: {
      type: "string",
      required: false,
      allowNull:true
    },
    BGImage: {
      type: "string",
      required: false,
      allowNull:true
    },
    Venue: {
      type: "string",
      required: false,
      allowNull:true
    },
    mainColor1: {
      type: "string",
      required: false,
      allowNull:true
    },
    mainColor2: {
      type: "string",
      required: false,
      allowNull:true
    },
    textColor1: {
      type: "string",
      required: false,
      allowNull:true
    },
    textColor2: {
      type: "string",
      required: false,
      allowNull:true
    },
    Vibes: {
      type: "string",
      required: false,
      allowNull:true
    },
    Sponsors: {
      type: "string",
      required: false,
      allowNull:true
    },
    Limit: {
      type: "number",
      required: false,
      allowNull:true
    },
    Artists: {
      type: "string",
      required: false,
      allowNull:true
    },
    Attendees: {
      type: "string",
      required: false,
      allowNull:true
    },
    Paid: {
      type: "boolean",
      required: false,
      allowNull:true
    },
    Hosts: {
      type: "string",
      required: false,
      allowNull:true
    },
    Template: {
      type: "string",
      required: false,
      allowNull:true
    },
    EventPic: {
      type: "string",
      required: false,
      allowNull:true
    },
    state: {
      type: "string",
      required: false,
      allowNull:true
    },
    opencall: {
      type: "boolean",
      required: false,
      allowNull:true
    },
    Artsubmit: {
      type: "string",
      required: false,
      allowNull:true
    },
    bgvideo: {
      type: "string",
      required: false,
      allowNull:true
    },
    Price: {
      type: "number",
      required: false,
      allowNull:true
    },
    Mode: {
      type: "string",
      required: false,
      allowNull:true
    },
    Event_venue: {
      type: "string",
      required: false,
      allowNull:true
    },
    url: {
      type: "string",
      required: false,
      allowNull:true
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log(`action bubble/events/update started. Inputs: ${JSON.stringify(inputs)}`);
    let obj  = {...inputs}
    try {
      let event = await sails.helpers.bubble.events.getOne(obj._id)
      if (!_.isUndefined(obj['CreatedBy'])) {        
        // obj.CreatedBy = '1649645992440x737245647951562100'
        obj.CreatedBy = JSON.stringify(await sails.helpers.bubble.users.getOne(obj.CreatedBy))        
      }
                 
        obj.StartDate = event.StartDate        
        obj.StartTime = event.StartTime
        obj.EndTime = event.EndTime
      if (!_.isUndefined(obj.Vibes)) {
        if (obj.Vibes.length) {
          obj.Vibes = JSON.stringify(obj.Vibes)   
        } else {
          delete obj.Vibes
        }                      
      }
      if (!_.isUndefined(obj.Sponsors)) {
        if (obj.Sponsors.length) {
          obj.Sponsors = JSON.stringify(obj.Sponsors)   
        } else {
          delete obj.Sponsors
        }                      
      }
      if (!_.isUndefined(obj.Artists)) {
        if (obj.Artists.length) {
          obj.Artists = JSON.stringify(obj.Artists)   
        } else {
          delete obj.Artists
        }                      
      }
      if (!_.isUndefined(obj.Attendees)) {
        if (obj.Attendees.length) {
          obj.Attendees = JSON.stringify(obj.Attendees)   
        } else {
          delete obj.Attendees
        }                      
      }
      if (!_.isUndefined(obj.Hosts)) {
        if (obj.Hosts.length) {
          obj.Hosts = JSON.stringify(obj.Hosts)   
        } else {
          delete obj.Hosts
        }                      
      }
      if (!_.isUndefined(obj.Artsubmit)) {
        if (obj.Artsubmit.length) {
          obj.Artsubmit = JSON.stringify(obj.Artsubmit)   
        } else {
          delete obj.Artsubmit
        }                      
      }  
      if (event.state) {
        obj.state = event.state
      }
      await Event.updateOrCreate({_id:obj._id},obj)
      sails.log("action bubble/events/update ended");
      return exits.success({
        status: true,
        message: "Event updated successfully",   
        data:obj
      });
    } catch (err) {
      sails.log.error(`Error in action bubble/events/update. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not update user"
      );
    }
  },
};
