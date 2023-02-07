/**
 * User_collection.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */


module.exports = {
	tableName: "user_collections",
	attributes: {
    user_id: {
      type: "string",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },   
    image: {
      type: 'string',
      allowNull:true
    },
    is_public: {
      type: "boolean",
      required: false,
      defaultsTo:true
    },
  },
  customToJSON: function () {   
    return _.omit(this, [           
      "createdAt",
      "updatedAt",      
    ]);
  },
  updateImage: async function (id) {
    try {
      let updatedImage = null;
      let latest_art_of_collection = await User_pinned_art.find({ where: { collection: id }, select: ["art"] }).populate("art").sort("id DESC").limit(1);
      if (latest_art_of_collection.length) {
        latest_art_of_collection = latest_art_of_collection[0].art;
        if (latest_art_of_collection.thumbnail) {          
          updatedImage = latest_art_of_collection.thumbnail
        }
      }
      await User_collection.updateOne({ id }).set({ image: updatedImage });
    } catch (err) {
      sails.log.error(`Error in model User_collection, function updateImage. ${err}`);
    }
    return false
  },
  deleteOne: async function (id,delete_pinned_items = false) {
    let deleted = false;
   try {
   deleted = await sails
    .getDatastore()
      .transaction(async (db) => {
        await User_collection.destroy({  id });   
        if (delete_pinned_items == true) {
          await User_pinned_art.destroy({ collection: id });
        } else {
          await User_pinned_art.update({ where: { collection: id } }).set({collection:null});
        }
        return true
    })
   } catch (err) {
     sails.log.error(`Error in Model User_collection, Function deleteOne. ${err}`)
   }
    return deleted;      
  },
  updateCollection: async function (id,obj) {
    let updated_collection = false
    try {
      updated_collection = await sails
      .getDatastore()
        .transaction(async (db) => {
          let updated = await User_collection.updateOne({
            id: id,
          }).set(obj)
          ///make sure to effect changes on pinned items of this collection as well
          // if (!_.isUndefined(obj.is_public)) {
          //   await User_pinned_art.update({
          //     collection: id,
          //   }).set({is_public:obj.is_public})
          // }
          return updated
      })
    } catch (err) {
      sails.log.error(`Error in model User_collection, function updateCollection. ${err}`);
    }
    return updated_collection
  },
};
