/**
 * Withdrawal_request.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "withdrawal_requests",
  attributes: {
    user_id: {
			type: "string",
			required: true,
			columnName: "user_id",
		},
    available_amount: {
			type: "number",
			required: false,
			defaultsTo:0
    },
    stripe_account_id: {
			type: "string",
			required: false,
			allowNull: true,
    },
    status: {
      model: "status",
      columnName:"status_id"
    },
  },
  createOne: async function (user) {
    let created = false;
   try {
    created = await sails
    .getDatastore()
      .transaction(async (db) => {
        let statuses = await sails.helpers.statuses.get([global.STATUS.PENDING])
        let obj = {user_id:user.id,stripe_account_id:user.stripe_account_id,available_amount:user.available_amount,status:statuses[global.STATUS.PENDING]}
        created = await Withdrawal_request.create(obj).fetch();   
        await User.updateOne({user_id:user.id}).set({available_amount:0})
        return !_.isUndefined(created)? true :false
    })
   } catch (err) {
     sails.log.error(`Error in Model Withdrawal_request, Function createOne. ${err}`)
   }
    return created;  
    
  },
  updateStatus: async function (id,status) {
    let updated = false;
    try {
      let statuses = await sails.helpers.statuses.get([status])
      await Withdrawal_request.updateOne({ id }).set({ status: statuses[status] })
      updated = true
   } catch (err) {
     sails.log.error(`Error in Model Withdrawal_request, Function updateStatus. ${err}`)
   }
    return updated;  
    
  },
  rejectWithdrawalRequest: async function (withdrawal_request) {
    let updated = false;
    try {
      updated = await sails
    .getDatastore()
      .transaction(async (db) => {        
        await Withdrawal_request.updateStatus(withdrawal_request.id, global.STATUS.REJECTED)
        let user = await User.findOne({ where: { user_id: withdrawal_request.user_id }, select: ["available_amount"] })
        let available_amount = parseFloat(user.available_amount)+parseFloat(withdrawal_request.available_amount)
        await User.updateOne({user_id:withdrawal_request.user_id}).set({available_amount})
        return true 
    })
   } catch (err) {
     sails.log.error(`Error in Model Withdrawal_request, Function rejectWithdrawalRequest. ${err}`)
   }
    return updated;  
    
  },

};

