/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */
const corsPolicy = {
  allRoutes: true,
  allowOrigins: "*",
  allowCredentials: false,
  allowRequestMethods: "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  allowRequestHeaders: "*",
};

require("dotenv").config({ path: ".env" });

module.exports.routes = {
  "GET /logic/ping": { action: "ping" },
  [`GET ${process.env.ROUTE_PREFIX}interests`]: { cors: corsPolicy, action: "interests/get" },
  [`GET ${process.env.ROUTE_PREFIX}vibes`]: { cors: corsPolicy, action: "vibes/get" },
  [`GET ${process.env.ROUTE_PREFIX}artists`]: { cors: corsPolicy, action: "artists/get" },
  [`GET ${process.env.ROUTE_PREFIX}artists/:user_id`]: { cors: corsPolicy, action: "artists/get-one" },
  [`GET ${process.env.ROUTE_PREFIX}user/followers`]: { cors: corsPolicy, action: "artists/followers" },
  [`GET ${process.env.ROUTE_PREFIX}user/following`]: { cors: corsPolicy, action: "artists/following" },
  [`GET ${process.env.ROUTE_PREFIX}communities`]: { cors: corsPolicy, action: "communities/get" },
  [`POST ${process.env.ROUTE_PREFIX}user/vibes/update`]: {
    cors: corsPolicy,
    action: "user/vibes/update",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/vibes`]: {
    cors: corsPolicy,
    action: "user/vibes/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/interests/update`]: {
    cors: corsPolicy,
    action: "user/interests/update",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/interests`]: {
    cors: corsPolicy,
    action: "user/interests/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/dashboard-feeds`]: {
    cors: corsPolicy,
    action: "user/dashboard-feeds",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/communities`]: {
    cors: corsPolicy,
    action: "user/communities/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/communities/drops/:community_id`]: {
    cors: corsPolicy,
    action: "user/communities/drops",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/follow-community`]: {
    cors: corsPolicy,
    action: "user/follow-community",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/follow-artist`]: {
    cors: corsPolicy,
    action: "user/follow-artist",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/followers/:follower_id`]: {
    cors: corsPolicy,
    action: "user/followers/delete",
  },
  [`GET ${process.env.ROUTE_PREFIX}arts/:id`]: { cors: corsPolicy, action: "arts/get-one" },
  [`GET ${process.env.ROUTE_PREFIX}arts`]: { cors: corsPolicy, action: "arts/get" },
  [`GET ${process.env.ROUTE_PREFIX}arts/related`]: { cors: corsPolicy, action: "arts/related" },

  /**
   * inputs:
   *  - art_id --> Required
   * - collection_id --> Optional
   * - is_public --> Optional
   *
   * process:
   *  - pin or unpin  an art
   *
   * outputs:
   *  - success/error
   */
  [`POST ${process.env.ROUTE_PREFIX}user/arts/pin-unpin`]: {
    cors: corsPolicy,
    action: "user/arts/pin-unpin",
  },
  /**
   * inputs:
   *  - art_id --> Optional (Either art_id or artist_collection_id must be provided)
   * - artist_collection_id --> Optional
   * - is_public --> Required
   *
   * process:
   *  - change privacy of pinned item (Art or Artist collection)
   *
   * outputs:
   *  - success/error
   */
  [`POST ${process.env.ROUTE_PREFIX}user/arts/pinned/change-privacy`]: {
    cors: corsPolicy,
    action: "user/arts/pinned/change-privacy",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/arts/pin-unpin`]: {
    cors: corsPolicy,
    action: "user/arts/pin-unpin",
  },

  /**
   * inputs:
   *  - artist_collection_id --> Required
   * - collection_id --> Optional
   *
   * process:
   *  - pin or unpin  an artist collection
   *
   * outputs:
   *  - success/error
   */
  [`POST ${process.env.ROUTE_PREFIX}user/art-collections/pin-unpin`]: {
    cors: corsPolicy,
    action: "user/art-collections/pin-unpin",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/arts/pinned/:collection_id?`]: {
    cors: corsPolicy,
    action: "user/arts/pinned/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/addresses`]: {
    cors: corsPolicy,
    action: "user/addresses/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/addresses`]: {
    cors: corsPolicy,
    action: "user/addresses/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/addresses/:id`]: {
    cors: corsPolicy,
    action: "user/addresses/update",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/addresses/:id`]: {
    cors: corsPolicy,
    action: "user/addresses/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/addresses/select-default`]: {
    cors: corsPolicy,
    action: "user/addresses/select-default",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/edit/personal-info`]: {
    cors: corsPolicy,
    action: "user/edit/personal-info",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/edit/social-login`]: {
    cors: corsPolicy,
    action: "user/edit/social-login",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/edit/profile`]: {
    cors: corsPolicy,
    action: "user/edit/profile",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/get/profile`]: {
    cors: corsPolicy,
    action: "user/get/profile",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/edit/become-artist`]: {
    cors: corsPolicy,
    action: "user/edit/become-artist",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/art-collections`]: {
    cors: corsPolicy,
    action: "user/art-collections/create",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/art-collections`]: {
    cors: corsPolicy,
    action: "user/art-collections/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/art-collections/:id`]: {
    cors: corsPolicy,
    action: "user/art-collections/get-one",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/art-collections/:id`]: {
    cors: corsPolicy,
    action: "user/art-collections/update",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/art-collections/:id`]: {
    cors: corsPolicy,
    action: "user/art-collections/delete",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/art-collections/art`]: {
    cors: corsPolicy,
    action: "user/art-collections/delete-art",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/art-collections/detail/:id`]: {
    cors: corsPolicy,
    action: "user/art-collections/detail/get-one",
  },

  [`POST ${process.env.ROUTE_PREFIX}user/collections`]: {
    cors: corsPolicy,
    action: "user/collections/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/collections/:id`]: {
    cors: corsPolicy,
    action: "user/collections/update",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/collections/:id`]: {
    cors: corsPolicy,
    action: "user/collections/delete",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/collections`]: {
    cors: corsPolicy,
    action: "user/collections/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/arts`]: {
    cors: corsPolicy,
    action: "user/arts/create",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/arts`]: {
    cors: corsPolicy,
    action: "user/arts/get",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/arts/:id`]: {
    cors: corsPolicy,
    action: "user/arts/update",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/arts/:id`]: {
    cors: corsPolicy,
    action: "user/arts/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/arts/support`]: {
    cors: corsPolicy,
    action: "user/arts/support",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/orders`]: {  
    cors: corsPolicy,
    action: "user/orders/create",
  },

  [`GET ${process.env.ROUTE_PREFIX}user/orders`]: {
    cors: corsPolicy,
    action: "user/orders/get",
  },

  [`GET ${process.env.ROUTE_PREFIX}user/orders/:id`]: {
    cors: corsPolicy,
    action: "user/orders/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/order-arts`]: {
    cors: corsPolicy,
    action: "user/order-arts/get",
  },
   
  [`POST ${process.env.ROUTE_PREFIX}user/orders/create-payment-intent`]: { 
    cors: corsPolicy,
    action: "user/orders/payment-intents/create",
  },  
    [`POST ${process.env.ROUTE_PREFIX}user/orders/change-privacy`]: {
    cors: corsPolicy,
    action: "user/orders/change-privacy",
  },

  [`GET ${process.env.ROUTE_PREFIX}user/cards`]: {
    cors: corsPolicy,
    action: "user/cards/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/cards`]: {
    cors: corsPolicy,
    action: "user/cards/add",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/cards`]: {
    cors: corsPolicy,
    action: "user/cards/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/cards/select-default`]: {
    cors: corsPolicy,
    action: "user/cards/select-default",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/transactions`]: {
    cors: corsPolicy,
    action: "user/transactions/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/comments`]: {
    cors: corsPolicy,
    action: "user/comments/create",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/comments`]: {
    cors: corsPolicy,
    action: "user/comments/get",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/comments/:id`]: {
    cors: corsPolicy,
    action: "user/comments/update",
  },

  [`GET ${process.env.ROUTE_PREFIX}user/comments/:id/replies`]: {
    cors: corsPolicy,
    action: "user/comments/replies",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/comments/:id`]: {
    cors: corsPolicy,
    action: "user/comments/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/comments/like-unlike`]: {
    cors: corsPolicy,
    action: "user/comments/like-unlike",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/search/items`]: {
    cors: corsPolicy,
    action: "user/search/items",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/sales`]: {
    cors: corsPolicy,
    action: "user/sales/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/sales/orders`]: {
    cors: corsPolicy,
    action: "user/sales/orders/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/sales/orders/:id`]: {
    cors: corsPolicy,
    action: "user/sales/orders/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/vibes/:vibe_id/arts`]: {
    cors: corsPolicy,
    action: "user/vibes/arts",
  },

  [`PUT ${process.env.ROUTE_PREFIX}user/sales/orders/:id`]: {
    cors: corsPolicy,
    action: "user/sales/orders/change-status",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/sales/orders/dispatch`]: {
    cors: corsPolicy,
    action: "user/sales/orders/dispatch",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/device-tokens`]: {   
    cors: corsPolicy,
    action: "user/device-tokens/save",
  },  
    [`DELETE ${process.env.ROUTE_PREFIX}user/device-tokens`]: {
    cors: corsPolicy,
    action: "user/device-tokens/delete",
  },
  
  [`GET ${process.env.ROUTE_PREFIX}user/stripe/return`]: {

    cors: corsPolicy,
    action: "user/stripe/return",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/stripe/webhook`]: {
    cors: corsPolicy,
    action: "user/stripe/webhook",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/stripe/accounts`]: {
    cors: corsPolicy,
    action: "user/stripe/accounts/create",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/stripe/accounts`]: {
    cors: corsPolicy,
    action: "user/stripe/accounts/get",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}user/stripe/accounts`]: {
    cors: corsPolicy,
    action: "user/stripe/accounts/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/withdrawals/request`]: {
    cors: corsPolicy,
    action: "user/withdrawals/request",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/notifications`]: {
    cors: corsPolicy,
    action: "user/notifications/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/notifications/unread-count`]: {
    cors: corsPolicy,
    action: "user/notifications/unread-count",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/notifications/mark-as-read`]: {
    cors: corsPolicy,
    action: "user/notifications/mark-as-read",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/events`]: {
    cors: corsPolicy,
    action: "user/events/get",
  },

  [`GET ${process.env.ROUTE_PREFIX}user/events/:id`]: {
    cors: corsPolicy,
    action: "user/events/get-one",
  },
 

  [`POST ${process.env.ROUTE_PREFIX}test/notifications`]: {
    cors: corsPolicy,
    action: "test/notifications/send",
  },
  
  [`GET ${process.env.ROUTE_PREFIX}settings`]: {
    cors: corsPolicy,
    action: "settings/get",
  },


  [`POST ${process.env.ROUTE_PREFIX}aws/sign-url`]: 'aws/sign-url',

  [`POST ${process.env.ROUTE_PREFIX}bubble/register`]: {
    cors: corsPolicy,
    action: "bubble/register",
  },
  [`PUT ${process.env.ROUTE_PREFIX}bubble/update-user`]: {
    cors: corsPolicy,
    action: "bubble/update-user",
  },
  [`PUT ${process.env.ROUTE_PREFIX}bubble/events`]: {
    cors: corsPolicy,
    action: "bubble/events/update",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}bubble/events`]: {
    cors: corsPolicy,
    action: "bubble/events/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/addresses/mark-picking-point`]: {
    cors: corsPolicy,
    action: "user/addresses/mark-picking-point",
  },
  [`POST ${process.env.ROUTE_PREFIX}user/orders/shipment/calculate-charges`]: {
    cors: corsPolicy,
    action: "user/orders/shipment/calculate-charges",
  },

  [`POST ${process.env.ROUTE_PREFIX}user/orders/track`]: {
    cors: corsPolicy,
    action: "user/orders/track",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/communities/data`]: {
    cors: corsPolicy,
    action: "user/communities/data",
  },
    
  [`POST ${process.env.ROUTE_PREFIX}user/communities/:community_id/forums`]: {
    cors: corsPolicy,
    action: "user/communities/forums/create",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/communities/:community_id/forums`]: {
    cors: corsPolicy,
    action: "user/communities/forums/get",
  },
  [`PUT ${process.env.ROUTE_PREFIX}user/communities/:id`]: {
    cors: corsPolicy,
    action: "user/communities/edit",
  },
  [`GET ${process.env.ROUTE_PREFIX}user/communities/:id`]: {
    cors: corsPolicy,
    action: "user/communities/get-one",
  },

  ///admin routes
  [`GET ${process.env.ROUTE_PREFIX}admin/interests/get`]: {
    cors: corsPolicy,
    action: "admin/interests/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}screen-contents/:key`]: {
    cors: corsPolicy,
    action: "screen-contents/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/interests`]: {
    cors: corsPolicy,
    action: "admin/interests/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/interests/:id`]: {
    cors: corsPolicy,
    action: "admin/interests/get-one",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/interests`]: {
    cors: corsPolicy,
    action: "admin/interests/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/interests/:id`]: {
    cors: corsPolicy,
    action: "admin/interests/edit",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}admin/interests/:id`]: {
    cors: corsPolicy,
    action: "admin/interests/delete",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/vibes`]: {
    cors: corsPolicy,
    action: "admin/vibes/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/vibes/:id`]: {
    cors: corsPolicy,
    action: "admin/vibes/get-one",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/vibes`]: {
    cors: corsPolicy,
    action: "admin/vibes/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/vibes/:id`]: {
    cors: corsPolicy,
    action: "admin/vibes/edit",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}admin/vibes/:id`]: {
    cors: corsPolicy,
    action: "admin/vibes/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/users`]: {
    cors: corsPolicy,
    action: "admin/users/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/users/:user_id`]: {
    cors: corsPolicy,
    action: "admin/users/update",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/users`]: {
    cors: corsPolicy,
    action: "admin/users/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/users/:user_id`]: {
    cors: corsPolicy,
    action: "admin/users/get-one",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/users/change-status`]: {
    cors: corsPolicy,
    action: "admin/users/change-status",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/artists`]: {
    cors: corsPolicy,
    action: "admin/users/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/artists/:user_id`]: {
    cors: corsPolicy,
    action: "admin/users/update",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/artists`]: {
    cors: corsPolicy,
    action: "admin/users/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/artists/:user_id`]: {
    cors: corsPolicy,
    action: "admin/users/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/communities`]: {
    cors: corsPolicy,
    action: "admin/communities/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/communities/:id`]: {
    cors: corsPolicy,
    action: "admin/communities/get-one",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/communities`]: {
    cors: corsPolicy,
    action: "admin/communities/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/communities/:id`]: {
    cors: corsPolicy,
    action: "admin/communities/edit",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}admin/communities/:id`]: {
    cors: corsPolicy,
    action: "admin/communities/delete",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/arts`]: {
    cors: corsPolicy,
    action: "admin/arts/create",
  },
  [`PUT ${process.env.ROUTE_PREFIX}admin/arts/:id`]: {
    cors: corsPolicy,
    action: "admin/arts/edit",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/arts`]: {
    cors: corsPolicy,
    action: "admin/arts/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/arts/:id`]: {
    cors: corsPolicy,
    action: "admin/arts/get-one",
  },
  [`DELETE ${process.env.ROUTE_PREFIX}admin/arts/:id`]: {
    cors: corsPolicy,
    action: "admin/arts/delete",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/art-collections`]: {
    cors: corsPolicy,
    action: "admin/art-collections/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/art-collections/:id`]: {
    cors: corsPolicy,
    action: "admin/art-collections/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/comments`]: {
    cors: corsPolicy,
    action: "admin/comments/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/comments/:id`]: {
    cors: corsPolicy,
    action: "admin/comments/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/sales`]: {
    cors: corsPolicy,
    action: "admin/sales/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/sales/:id`]: {
    cors: corsPolicy,
    action: "admin/sales/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/purchases`]: {
    cors: corsPolicy,
    action: "admin/purchases/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/purchases/:id`]: {
    cors: corsPolicy,
    action: "admin/purchases/get-one",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/addresses`]: {
    cors: corsPolicy,
    action: "admin/addresses/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/withdrawal-requests`]: {
    cors: corsPolicy,
    action: "admin/withdrawal-requests/get",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/withdrawal-requests/approve`]: {
    cors: corsPolicy,
    action: "admin/withdrawal-requests/approve",
  },
  [`POST ${process.env.ROUTE_PREFIX}admin/withdrawal-requests/reject`]: {
    cors: corsPolicy,
    action: "admin/withdrawal-requests/reject",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/events`]: {
    cors: corsPolicy,
    action: "admin/events/get",
  },
  [`GET ${process.env.ROUTE_PREFIX}admin/events/:id`]: {
    cors: corsPolicy,
    action: "admin/events/get-one",
  },
};
