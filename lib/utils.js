'use strict';

import _ from 'lodash';

let Routes = {};
let RouteNavBar = {};
let RouteStatusBar = {};

module.exports = {
  // ** ** ** **
  // Config (Routes)
  //
  addRoutes: function(obj) {
    Object.assign(Routes, obj);
    Object.keys(obj).map( key => {
      const data = obj[key];
      RouteNavBar[key] = data.navBar;
      RouteStatusBar[key] = data.statusBar;
    });
  },
  getRoute: function(obj,name) {
    let route = {};
    if (obj && obj.key) {
      if (Routes[obj.key]) {
        route = Routes[obj.key] || {};
        route = Object.assign({}, route, obj);
      } else
        console.warn(`You requested a route for ${obj.key} but it could not be found.`);
    };

    if (name === '*')
      return route;
    return _.pick(route, name || ['component','props']);
  },
  getRouteNavBar: function(route) {
    return RouteNavBar[route.key] || {};
  },
  getRouteStatusBar: function(route) {
    return RouteStatusBar[route.key] || {};
  },
};
