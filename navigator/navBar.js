'use strict';

import React from 'react';
import {
  StyleSheet,
  Text, View,
  TouchableOpacity
} from 'react-native';

import { getRouteNavBar } from '../lib/utils';

export function NavBarTitle({modifier={},route,defaults}) {
  const navBar = Object.assign({}, defaults, getRouteNavBar(route), route.navBar, modifier);

  if (React.isValidElement(navBar.title))
    return navBar.title;
  else if (typeof navBar.title == 'function')
    return React.createElement(navBar.title);
  else if (navBar.title) {

    const styles = (name) => {
      return [base[name], {
        color: navBar.color
      }];
    };

    return (
      <View style={base.navBarTitle}>
        <Text style={styles('navTitleText')}>{navBar.title}</Text>
      </View>
    );
  };
  return null; // Must return null
};

export function LeftButton({modifier={},route,defaults,navigate,index}) {
  const navBar = Object.assign({}, defaults, getRouteNavBar(route), route.navBar, modifier);

  if (React.isValidElement(navBar.leftButton))
    return navBar.leftButton;
  else if (typeof navBar.leftButton == 'function')
    return React.createElement(navBar.leftButton);
  else if ((navBar.leftButton || index) && !navBar.hideLeftButton) {

    const styles = (name) => {
      return [base[name], {
        color: navBar.color
      }];
    };

    return (
      <TouchableOpacity
        style={base.navSide}
        onPress={navBar.leftButtonFunc || navigate.bind(null, {type: 'pop'})}
      >
        <Text style={styles('navSideText')}>{navBar.leftButton || 'Back'}</Text>
      </TouchableOpacity>
    );
  };
  return null; // Must return null
};

export function RightButton({modifier={},route,defaults,navigate}) {
  const navBar = Object.assign({}, defaults, getRouteNavBar(route), route.navBar, modifier);

  if (React.isValidElement(navBar.rightButton))
    return navBar.rightButton;
  else if (typeof navBar.rightButton == 'function')
    return React.createElement(navBar.rightButton);
  else if (navBar.rightButton) {

    let action;
    if (typeof navBar.rightButtonFunc == 'function')
      action = navBar.rightButtonFunc;
    else if (navBar.rightButtonRoute)
      action = navigate.bind(null, navBar.rightButtonRoute);

    const styles = (name) => {
      return [base[name], {
        color: navBar.color
      }];
    };

    return (
      <TouchableOpacity style={[base.navSide, base.navSideRight]} onPress={action}>
        <Text style={styles('navSideText')}>{navBar.rightButton}</Text>
      </TouchableOpacity>
    );
  };
  return null; // Must return null
};

const base = StyleSheet.create({

  // Title
  navBarTitle: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  navTitleText: {
    alignSelf: 'center',
    fontSize: 18, fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent'
  },

  // Side Buttons
  navSide: {
    flex: 1, alignSelf: 'stretch', justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingLeft: 10, paddingRight: 10
  },
  navSideRight: {
    alignItems: 'flex-end'
  },
  navSideText: {
    fontSize: 15, fontWeight: '400', color: '#202020',
    backgroundColor: 'transparent'
  },
})
