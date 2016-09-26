'use strict';

import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import {
  Text, View,
  Animated,
  ActivityIndicator,
  StatusBar,
  Platform,
  NavigationExperimental
} from 'react-native';

import { getRoute, getRouteNavBar, getRouteStatusBar } from '../lib/utils';
import styles from './styles';
import { NavBarTitle, LeftButton, RightButton } from './navBar';

const { Header, CardStack, StateUtils } = NavigationExperimental;

const NAV_HT = Platform.OS === 'ios' ? 44 : 40; // TODO get real height in Android
const STATUS_BAR_HT = 20; // TODO get real height in Android

let _navigator;
let _modifiers = {};

function createReducer(initialState) {
  return (currentState = initialState, action) => {

    if (_modifiers[currentState.index+1])
      delete _modifiers[currentState.index+1];

    switch (action.type) {
      case 'back':
      case 'forward':
      case 'jumpTo':
      case 'jumpToIndex':
      case 'replaceAt':
      case 'reset':
      case 'push':
        return StateUtils[action.type](currentState, action.params);
      case 'pop':
        return currentState.index > 0
          ? StateUtils.pop(currentState)
          : currentState;
      case 'replaceAtIndex':
        return StateUtils.replaceAtIndex(
          currentState,
          action.index,
          action.params
        );
      case 'replaceAtPrevious':
        if (currentState.index)
          return StateUtils.replaceAtIndex(
            currentState,
            currentState.index-1,
            action.params
          );
        else
          return currentState;
      case 'replace':
        return StateUtils.replaceAtIndex(
          currentState,
          currentState.index,
          action.params
        );
      case 'modify':
        let newRoute = currentState.routes[currentState.index];
        newRoute.version = !isNaN(newRoute.version) ? newRoute.version+1 : 0;

        if (!_modifiers[currentState.index])
          _modifiers[currentState.index] = {};
        _.map(action.modifier, (data,key) => {
          if (typeof data == 'object' && typeof _modifiers[currentState.index][key] == 'object')
            Object.assign(_modifiers[currentState.index][key], data);
          else
            _modifiers[currentState.index][key] = data;
        });

        return StateUtils.replaceAtIndex(
          currentState,
          currentState.index,
          Object.assign({}, newRoute) // Doing this will pass the === check
        );
      default:
        return currentState;
      }
   }
};

const actions = ['go','pop','reset','modify','current']
export const API = _.zipObject( actions, actions.map( name =>
  function() {
    const args = _.flatten(_.values(arguments));
    _navigator[name] && _navigator[name].apply(null, args);
  }
));

export default class CardStackNavigator extends Component {
  static displayName = 'CardStackNavigator';
  static propTypes = {
    initialRoute: PropTypes.object.isRequired,
  };

  constructor(p) {
    super(p);

    let initialRoute = (p.route && p.route.get('params')) || p.initialRoute;
    if (Array.isArray(initialRoute)) initialRoute = initialRoute[0];

    this._navReducer = createReducer({
      index: 0,
      key: 'App',
      routes: [initialRoute]
    });

    this._API = this._getNavigator();
    let navBar = getRouteNavBar(initialRoute);
    navBar = Object.assign({}, navBar, p.defaults.navBar)
    _navigator = this._API;

    this._navBg = [
      navBar.backgroundColor || 'rgba(255,255,255,1)',
      navBar.backgroundColor || 'rgba(255,255,255,1)'
    ];
    this.state = {
      router: this._navReducer(undefined, {}),
      navBg: new Animated.Value(0),
      navState: new Animated.Value(navBar && navBar.hidden ? 0 : 1),
    };
  }
  componentWillReceiveProps(np) {
    if (np.route && np.route.get('params') && this.props.route != np.route)
      this._navigate({
        type: np.route.get('action') || 'push',
        params: np.route.get('params')
      });
  }

  // ** ** ** **
  // Utility
  //
  _getNavigator() {
    // If changing this, you must change refs too.
    return {
      go: this._navigate.bind(this),
      pop: this._navigate.bind(this, {type: 'pop'}),
      reset: (stack) => this._navigate({type: 'reset', params: stack}),
      modify: (modifier) => {
        this._navigate({type: 'modify', modifier});
      },
      current: (name) => {
        const route = getRoute(this.state.router.routes[this.state.router.index], '*');
        const request = route[name];
        if (!request && ['navBar','statusBar'].indexOf(name) >= 0)
          return {};
        return request;
      },
    };
  }
  _navigate(action) {
    if (typeof action === 'object' && !action.type && !action.params)
      action = {
        type: 'push',
        params: action
      };

    let newState = {
      router: this._navReducer(this.state.router, action)
    };
    if (newState.router === this.state.router)
      return false;

    let nextNavState, navBar;
    const index = newState.router.routes.length-1;
    const topRoute = newState.router.routes[index];

    if (topRoute) {
      navBar = Object.assign({},
        this.props.defaults.navBar,
        getRouteNavBar(topRoute),
        topRoute.navBar,
        _modifiers[index] && _modifiers[index].navBar
      );

      if (navBar && typeof(navBar.hidden) === 'boolean')
        nextNavState = navBar.hidden;
      nextNavState = nextNavState ? 0 : 1;
    };

    this.setState(newState);

    if (this.state.navState._value != nextNavState)
      Animated.timing( this.state.navState, {
        toValue: nextNavState,
        duration: 150,
      }).start();
      // this.state.navState.setValue(nextNavState);

    const bgVal = this.state.navBg._value;
    const nextVal = bgVal ? 0 : 1;
    const curBg = this._navBg[bgVal];

    if (navBar && navBar.backgroundColor && navBar.backgroundColor != curBg) {
      this._navBg[nextVal] = navBar.backgroundColor;
      Animated.timing( this.state.navBg, {
        toValue: nextVal,
        duration: 150,
      }).start();
    };

    return true;
  }
  _navigateBack() {
    const index = this.state.router.index;
    let onPop = _modifiers[index] && _modifiers[index].onPop;
    if (!onPop) onPop = getRoute(this.state.router.routes[index], 'onPop');

    if (typeof onPop == 'function')
      onPop(() => this._navigate({type: 'pop'}));
    else
      this._navigate({type: 'pop'})
  }

  // ** ** ** **
  // Render
  //
  renderNavBar(props): ReactElement {
    const navBar = Object.assign({},
      this.props.defaults.navBar,
      getRouteNavBar(props.scene.route),
      props.scene.route.navBar,
      _modifiers[props.scene.index] && _modifiers[props.scene.index].navBar
    );
    const statusBar = Object.assign({},
      this.props.defaults.statusBar,
      getRouteStatusBar(props.scene.route),
      props.scene.route.statusBar,
      _modifiers[props.scene.index] && _modifiers[props.scene.index].statusBar
    );

    const Title = (page) => (
      <NavBarTitle
        modifier={_modifiers[page.scene.index] && _modifiers[page.scene.index].navBar}
        route={page.scene.route}
        defaults={this.props.defaults.navBar}
      />
    );
    const Left = (page) => (
      <LeftButton
        modifier={_modifiers[page.scene.index] && _modifiers[page.scene.index].navBar}
        route={page.scene.route}
        defaults={this.props.defaults.navBar}
        navigate={this._navigate.bind(this)}
        index={props.scene.index}
      />
    );
    const Right = (page) => (
      <RightButton
        modifier={_modifiers[page.scene.index] && _modifiers[page.scene.index].navBar}
        route={page.scene.route}
        defaults={this.props.defaults.navBar}
        navigate={this._navigate.bind(this)}
      />
    );

    const wrapper = {
      height: Header.HEIGHT,
      backgroundColor: this.state.navBg.interpolate({
        inputRange: [0,1],
        outputRange: [this._navBg[0], this._navBg[1]]
      }),
      marginTop: this.state.navState.interpolate({
        inputRange: [0,1],
        outputRange: [(Header.HEIGHT)*-1,0]
      }),
      opacity: this.state.navState.interpolate({
        inputRange: [0,.5,1],
        outputRange: [0,0,1]
      }),
    };

    let navBarStyle = styles.navBar;
    if (navBar.noBorder)
      navBarStyle = [navBarStyle, {borderBottomWidth: 0}];
    if (!statusBar.backgroundColor)
      statusBar.backgroundColor = navBar.backgroundColor;

    return (
      <Animated.View style={wrapper}>
        <StatusBar {... statusBar} animated={true} />
        <Header
          {... props}
          renderLeftComponent={Left}
          renderRightComponent={Right}
          renderTitleComponent={Title}
          style={navBarStyle}
        />
      </Animated.View>
    );
  }
  renderScene(props): ReactElement {
    const route = getRoute(props.scene.route);
    const navBar = Object.assign({},
      this.props.defaults.navBar,
      getRouteNavBar(props.scene.route),
      props.scene.route.navBar
    );
    return (
      <View style={styles.area}>
        {React.createElement(route.component, route.props)}
      </View>
    );
  }
  render(): ReactElement {
    if (this.props.locked)
      return (
        <View style={styles.area}>
          <ActivityIndicator size='large' />
        </View>
      );
    return (
      <CardStack
        renderHeader={this.renderNavBar.bind(this)}
        navigationState={this.state.router}
        onNavigate={this._navigate.bind(this)}
        onNavigateBack={this._navigateBack.bind(this)}
        renderScene={this.renderScene.bind(this)}
      />
    );
  }
};
