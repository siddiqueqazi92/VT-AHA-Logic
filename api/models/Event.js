/**
 * Event.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "events",
  primaryKey: "id",
  attributes: {
    _id: {
      type: "string",
      required: true,
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
  customToJSON: function () {
    this.Attendees_count = 0
    if (!_.isUndefined(this.Vibes)) {
        this.Vibes = JSON.parse(this.Vibes)   
    }
    if (!_.isUndefined(this.Hosts)) {      
        this.Hosts = JSON.parse(this.Hosts)   
    }
    if (!_.isUndefined(this.Sponsors)) {      
        this.Sponsors = JSON.parse(this.Sponsors)   
    }
    if (!_.isUndefined(this.Artists)) {      
        this.Artists = JSON.parse(this.Artists)   
    }
    if (!_.isUndefined(this.Attendees)) {      
      this.Attendees = JSON.parse(this.Attendees)   
      this.Attendees_count = Array.isArray(this.Attendees)?this.Attendees.length:0
    }
    if (!_.isUndefined(this.Artsubmit)) {      
        this.Artsubmit = JSON.parse(this.Artsubmit)   
    }
    if (!_.isUndefined(this.CreatedBy)) {      
        this.CreatedBy = JSON.parse(this.CreatedBy)   
    }
    if (!_.isUndefined(this.url)) {      
        this.url = sails.config.bubble.url+this.url
    }
		return _.omit(this, ["createdAt","updatedAt"]);
	},
  createEvents: async function (events_data) {
    let created = false
    try {
      created = await sails
      .getDatastore()
        .transaction(async (db) => {
          for (obj of events_data) {
            
            obj.url = `/event/${obj._id}?debug_mode=true`
            if (!_.isUndefined(obj['Created By'])) {
              obj.CreatedBy = obj['Created By']
              // obj.CreatedBy = '1649645992440x737245647951562100'
              obj.CreatedBy = JSON.stringify(await sails.helpers.bubble.users.getOne(obj.CreatedBy))
              delete obj['Created By']
            }
            if (!_.isUndefined(obj['Created Date'])) {
              obj.CreatedDate = obj['Created Date']
              delete obj['Created Date']
            }
            if (!_.isUndefined(obj['Modified Date'])) {
              obj.ModifiedDate = obj['Modified Date']
              delete obj['Modified Date']
            }
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
            
              await Event.updateOrCreate({ _id: obj._id }, obj)              
          }     

          // if (events_data.length) {
          //   await Event.createEach(events_data)
          // }
          
          return true
      })
    } catch (err) {
      sails.log.error(`Error in model Event, function createEvents. ${err}`)
    }
    return created
  },
  getCommunitiesEvents: async function(filter = {user_id:null,offset:0,limit:10}) {
    let data = [];
    let where = `e.state in ('published',null) and e."StartDate"::date > now()`
    
    let query = `
    select 
    e._id as id, e."Name" as title, 'https:' || e."EventPic" as thumbnail, 'event' as type, null as resource_type    
    from events e
    where ${where}    
    order by e."StartDate" asc
    offset ${filter.offset} limit ${filter.limit}    
    `
    sails.log(query);
    try {
      
      let result = await sails.sendNativeQuery(query);
      data = result.rows                
    } catch (err) {
      sails.log.error(`Error in model Event, function getCommunitiesEvents. ${err}`)
      
    }
    return data
  },

};

