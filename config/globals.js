/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on any of these options, check out:
 * https://sailsjs.com/config/globals
 */
global.AHA_COMMISSION = 10;
global.AHA_ARTIST = {
  username:"aha"
}
global.DEFAULT_THUMBNAIL = 'https://ahauserposts.s3.amazonaws.com/video-files.png'
 global.STATUS = {  
  COMPLETED: "completed",
  CANCELLED: "cancelled",  
  INQUEUE: "inqueue",  
  PROCESSING: "processing",  
  DISPATCHED: "dispatched",  
  PENDING: "pending",  
  APPROVED: "approved",  
  TRANSFERRED: "transferred",  
  REJECTED: "rejected",    
  RETURNED: "returned",    
 };
global.SHIPPO_STATUS = {
  SUCCESS: 'SUCCESS',
  CONFIRMED: 'CONFIRMED',
  ERROR: 'ERROR',
  DELIVERED: 'DELIVERED',
  UNKNOWN: 'UNKNOWN',
  PRE_TRANSIT:'PRE_TRANSIT',
  TRANSIT:'TRANSIT',
  RETURNED:'RETURNED',
  FAILURE:'FAILURE',
}
global.ART_TYPE = {
   DEFAULT:'default',
   DROP:'drop',
 }
global.ROLE = {
   ADMIN:'admin',
   USER:'user',
 }
module.exports.globals = {
  /****************************************************************************
   *                                                                           *
   * Whether to expose the locally-installed Lodash as a global variable       *
   * (`_`), making  it accessible throughout your app.                         *
   *                                                                           *
   ****************************************************************************/

  _: require("@sailshq/lodash"),
  

  /****************************************************************************
   *                                                                           *
   * This app was generated without a dependency on the "async" NPM package.   *
   *                                                                           *
   * > Don't worry!  This is totally unrelated to JavaScript's "async/await".  *
   * > Your code can (and probably should) use `await` as much as possible.    *
   *                                                                           *
   ****************************************************************************/

  async: false,

  /****************************************************************************
   *                                                                           *
   * Whether to expose each of your app's models as global variables.          *
   * (See the link at the top of this file for more information.)              *
   *                                                                           *
   ****************************************************************************/

  models: true,

  /****************************************************************************
   *                                                                           *
   * Whether to expose the Sails app instance as a global variable (`sails`),  *
   * making it accessible throughout your app.                                 *
   *                                                                           *
   ****************************************************************************/

  sails: true,
  "process.env": require("dotenv").config({ path: ".env" }),
};
