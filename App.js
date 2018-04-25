/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import axios from 'axios';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import RNAdyen from './RNAdyenNativeModule';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  componentDidMount() {
    RNAdyen.RNEventEmitter.addListener('getToken', token => {
      console.log('My TOken', token);
    });
    RNAdyen.RNEventEmitter.addListener(
      'getPreferredMethods',
      paymentMethods => {
        console.log('getPreferredMethods', paymentMethods);
      }
    );
    RNAdyen.RNEventEmitter.addListener('paymentResult', result => {
      console.log('paymentResult', result);
    });
  }

  onPress = () => {
    RNAdyen.initializeAdyen();
  };

  onSetPaymentData = () => {
    const url =
      'https://checkoutshopper-test.adyen.com/checkoutshopper/demoserver/setup';
    const headers = {
      'Content-Type': 'application/json',
      'x-demo-server-api-key':
        '0101368667EE5CD5932B441CFA249797700BB3ED984382001996594C2871C36C988A6F4895CE553FEB759497D9C47DE3F7D80B9669600E9B6710C15D5B0DBEE47CDCB5588C48224C6007',
    };
    const data = {
      reference: '#237867422',
      countryCode: 'NL',
      shopperLocale: 'nl_NL',
      shopperReference: 'user349857934',
      returnUrl: 'adyenCustomIntegrationExample://',
      channel: 'ios',
      token:
        'eyJsb2NhbGUiOiJlbl9VUyIsImRldmljZUlkZW50aWZpZXIiOiI2MzRCRTc2Ri02M0JFLTRBREItOEU0Qy1DMkUzNzgwMDVGMkEiLCJkZXZpY2VGaW5nZXJwcmludFZlcnNpb24iOiIxLjAiLCJwbGF0Zm9ybSI6ImlvcyIsImludGVncmF0aW9uIjoiY3VzdG9tIiwib3NWZXJzaW9uIjoiMTEuMiIsInNka1ZlcnNpb24iOiIxLjE2LjAiLCJhcGlWZXJzaW9uIjoiNiIsImRldmljZU1vZGVsIjoieDg2XzY0In0=',
      amount: {
        value: 100,
        currency: 'EUR',
      },
    };
    const options = {
      method: 'POST',
      headers,
      data,
      url,
    };
    axios(options)
      .then(res => RNAdyen.setPaymentData(res.data))
      .catch(err => console.log(err));
  };

  onSetCardDetails = () => {
    RNAdyen.setCardDetails({
      name: 'Renga',
      number: '5555444433331111',
      expiryDate: '08/18',
      cvc: '737',
      shouldSave: true,
    });
  };

  onSetPaymentMethods = () => {
    RNAdyen.setPaymentMethod('card');
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.instructions}>Press Button in Hirerchy</Text>

        <TouchableOpacity style={styles.welcome} onPress={this.onPress}>
          <Text>Open Adyen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.welcome}
          onPress={this.onSetPaymentData}
        >
          <Text>Set Set PaymentData </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.welcome}
          onPress={this.onSetCardDetails}
        >
          <Text>Set Card Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.welcome}
          onPress={this.onSetPaymentMethods}
        >
          <Text>Set Payment Method</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
