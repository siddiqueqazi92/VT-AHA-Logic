/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {
  trustProxy: true,
  middleware: {
    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP requests.           *
     * (This Sails app's routes are handled by the "router" middleware below.)  *
     *                                                                          *
     ***************************************************************************/

    order: [
      "cookieParser",
      "session",
      "extendTimeout",
      "bodyParser",
      "compress",
      "poweredBy",
      "router",
      "www",
      "favicon",
    ],

    extendTimeout: function (req, res, next) {
      //req.setTimeout(300 * 1000); // Increase the request timeout to 5 minutes

      return next();
    },
    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests.       *
     *                                                                          *
     * https://sailsjs.com/config/http#?customizing-the-body-parser             *
     *                                                                          *
     ***************************************************************************/

    bodyParser: (function _configureBodyParser() {
      var skipper = require("skipper");
      var middlewareFn = skipper({
        // strict: true,
        limit: "1000mb",
      });
      return middlewareFn;
    })(),
  },
};
