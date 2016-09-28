
### React Native Card Stack Navigator
This package gives you the `<CardStackNavigator />` component using the **latest Navigator-Experimental API**. It allows you to:

1. Go to a pre-defined route with or without modifications (i.e. props, different title or navBar/statusBar configurations).  
2. Modify any routes (current or previous in the stack) at any time, any number of times. (i.e. change the title or change navBar colors, etc).  
3. Add callback functions to pop/back events (triggered by either swipe or the pop() API).  
4. Add left/right button functions to the navigator bar.  
5. Use all of the available APIs in the latest Navigator Experimental by Facebook.


> **_Quote: Facebook Team_**  
> The differences between Navigator and NavigatorIOS have been a common source of confusion for newcomers. Facebook is transitioning from Navigator to NavigationExperimental, which will be the supported navigation library going forward.

## Why
Routing is different in Web vs Mobile. Quite frankly, there's no such thing as routing in Mobile apps, just navigating and mounting scenes. URLs are a **foreign concept** within mobile apps unless you are using it from browser to enter your mobile app.

While using other routers for React Native and using the Navigator API on its own, there were lots of pain points as well. For example, being able to fully control the NavBar and what goes in there. Or modifying the scene after it has been mounted, i.e. changing the title, left/right button, etc after landing on a scene. Or mounting/re-using a scene in a flexible way, i.e. I may want to route to a scene with different props for scenario A and B.

Most react native router packages are still created using the old Navigator API (seen in the documentation website). This Navigator API is outdated, deprecated and has many issues. For example, it's impossible to add a callback function to the navigator.pop() when its called by a swipe gesture.

This package was created to solve all these problems using the latest Navigator Experimental API by Facebook.

There are some really popular router(s) out there but its API is became too complicated. They were created earlier in the development cycle of React Native with the original Navigator and they had to evolve and upgrade. This navigator is written extremely minimally; with only one dependency (lodash); and with very simple easy to understand API and code.

### How to Use
First add your routes using NavUtils. Then mount the `<CardStackNavigator />` component with an initialRoute passed to the props.

```javascript
import React from 'react';
import yourRoutes from './lib/routes';
import CardStackNavigator, { NavUtils } from 'react-native-cardstack-navigator';

// Add routes to your app.
NavUtils.addRoutes(yourRoutes);

// Mount the component
AppRegistry.registerComponent('vsm', () => (
  <CardStackNavigator
    initialRoute={{key: 'yourInitialRoute'}}
    defaults={{
      navBar: { backgroundColor: '#FFF', color: '#202020'},
      statusBar: { barStyle: 'default' },
    }}
  />
));
```

### How to format your routes
Your routes should be formatted like the example below. In this example, "route1" and "route2" are the names of the routes. You can call upon them respectively by passing an object like so: {key: "route1"} and {key: "route2"}.

```javascript
{
  route1: {
    component: SomeComponent1,
    navBar: {
      title: 'Route1',
      backgroundColor: 'blue', color: 'red'
    },
    statusBar: {
      barStyle: 'light-content'
    }
  },
  route2: {
    component: SomeComponent2,
    navBar: {
      title: 'Route2',
      leftButton: 'Something',
      rightButton: <SomeRightButtonComp />,
      rightButtonFunc: () => console.log("hai")
    }
  },
}
```

### How to Navigate
In order to the Navigator's API such as navigate, modify, pop, control the navBar, control the statusBar, etc, you have to first import the class.

```javascript
import { Navigator } from 'react-native-cardstack-navigator';
```

**Go to a route:**  

```javascript
Navigator.go({
	key: 'name-of-route'
});
```

**Go to a route with modifications**  

```javascript
Navigator.go({
	key: 'name-of-route',
	props: { a: 'apple' },
	navBar: { title: 'Fruit' }
});
```

**Go to a route with a custom action (not push)**  
When routing with a different action, you must put the route object under "params" name space and the action name under "type".

```javascript
Navigator.go({
	type: 'replaceAtIndex',
	index: 2,
	params: {
		key: 'name-of-route',
	}
});
```
Another example

```javascript
Navigator.go({
	type: 'replaceAtPrevious',
	params: {
		key: 'name-of-route',
	}
});
```

Currently these are the allowed actions you can use to route using the Navigator API.  
push (this is the default action)  
replaceAtIndex  (must pass index)
replaceAtPrevious  
jumpTo  
jumpToIndex  

All the other Navigator-Experimental API are also allowed but they haven't been tested yet.

You also have an action name "replace" available to you which is basically replaceAtIndex with the top most index. "replace" is a shortcut helper.

### Go Back
You can go back to the previous route by:

```javascript
Navigator.pop();
```

### Modify
You can modify an existing route with the following API. If you want to modify a route that you are currently _not_ on (for example, a previous page in the stack), then you should use _replaceAtIndex or replaceAtPrevious_ using the go() method.

```javascript
Navigator.modify({
	navBar: {
		title: 'abc',
		backgroundColor: 'blue',
		color: 'white',
		leftButton: "Hello",
		leftButtonFunc: () => console.log('something')
		rightButton: "World",
		rightButtonFunc: () => console.log('something')
	},
	statusBar: {
		barStyle: 'light-content',
		backgroundColor: 'green',
	},
	onPop: () => console.log('O Hai')
});
```

### Add a Callback to Pop()
In order to add a callback to your routes, define/modify/navigate to your route with an `onPop()` property. The callback function will trigger when you swipe back or call the `pop()` API or press the back button.
