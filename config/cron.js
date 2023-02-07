module.exports.cron = {
	myFirstJob: {
	  schedule: '0 */1 * * * *',//runs every 1 minutes
	//   schedule: '* * * * * *',
		onTick: async function () {
			console.log("cron",new Date())
			await sails.helpers.bubble.events.get()
		
		},
		start: true, // Start task immediately
	}
  };