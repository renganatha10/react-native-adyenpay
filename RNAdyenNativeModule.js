//  Created by react-native-create-bridge

import { NativeModules, NativeEventEmitter } from 'react-native';

const { RNAdyen } = NativeModules;

const RNEventEmitter = new NativeEventEmitter(RNAdyen);

export default {
  initializeAdyen() {
    console.log(RNAdyen, 'RNADUEN');
    return RNAdyen.initializeAdyen();
  },
  RNEventEmitter,
  EXAMPLE_CONSTANT: RNAdyen.EXAMPLE_CONSTANT,
};
