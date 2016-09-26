
import { StyleSheet, Dimensions } from 'react-native';

const NAV_HT = 44;

export default StyleSheet.create({
  // Navigator
  area: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  navBar: {
    position: 'absolute', top:0, left: 0, right: 0,
    backgroundColor: 'transparent'
  },
  overlay: {
    position: 'absolute', left: 0, right: 0, top: 0,
    height: Dimensions.get('window').height, // Can't use bottom: 0
    justifyContent: 'center', alignItems: 'center'
  },
  overlayText: {
    fontSize: 16, color: '#FFF',
    marginTop: 5, marginBottom: 20
  },

  // Alert Bar (DEPRECATED)
  alertBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: NAV_HT,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    // justifyContent: 'space-between'
  },

  // Message
  msgBody: {
    alignItems: 'center', flexWrap: 'wrap',
    flex: .5,
    overflow: 'hidden',
    paddingLeft: 10,
  },
  avatar: {
    width: 34, height: 34, marginRight: 7, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,.25)'
  },

  // Yes or No
  choices: {
    flex: .5, flexDirection: 'row',
    padding: 7
  },
  yes: {
    flex: .5, height: 30,
    borderTopRightRadius: 2, borderBottomRightRadius: 2,
    justifyContent: 'center', alignItems: 'center'
  },
  no: {
    flex: .5, height: 30,
    borderTopLeftRadius: 2, borderBottomLeftRadius: 2,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.1)'
  },

});
