//  Created by react-native-create-bridge

import { NativeModules, NativeEventEmitter } from 'react-native';

const { RNAdyen } = NativeModules;

const RNEventEmitter = new NativeEventEmitter(RNAdyen);

export default {
  initializeAdyen() {
    return RNAdyen.initializeAdyen();
  },
  setPaymentData(data) {
    return RNAdyen.setPaymentData(data);
  },
  setCardDetails(data) {
    return RNAdyen.setCardDetails(data);
  },
  setPaymentMethod(data) {
    return RNAdyen.setPaymentMethod(data);
  },
  RNEventEmitter,
  EXAMPLE_CONSTANT: RNAdyen.EXAMPLE_CONSTANT,
};
