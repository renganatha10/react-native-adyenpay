/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { PipoUtil } from './PipoUtils';
import {
  core,
  store,
  getApplicationConfiguration,
  createCustomer,
  attachCustomerToOrder,
  createPayment,
  addProductToOrder,
  getShoppingCart,
} from '@springtree/eva-sdk-redux';
import { Provider } from 'react-redux';

import axios from 'axios';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
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

export const pipoSettings = new PipoUtil();

core.init(pipoSettings.authenticationToken, pipoSettings.endPointURL);

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      idealMethods: [],
      isLoading: true,
    };
  }

  createCustomers = (orderID, totalAmount) => {
    const data = {
      User: {
        EmailAddress: 'saurabhsahu13@gmail.com',
        Gender: 'M',
        Initials: undefined,
        FirstName: 'Saurabh',
        LastName: 'Sahu',
        PhoneNumber: '9916095024',
        SubscriptionType: undefined,
        DateOfBirth: undefined, // DateTime, nullable
        PlaceOfBirth: 'Muzaffarpur',
        BankAccount: undefined,
        Nickname: 'saurabh',
        Password: '12345678',
        LanguageID: undefined,
        ShippingAddress: undefined,
        BillingAddress: undefined,
      },
      NoAccount: true,
      AutoLogin: true,
    };

    const [action, promise] = createCustomer.createFetchAction(data);
    store.dispatch(action);
    promise.then(
      res => {
        console.log(res, 'Create Cusotmer');
        const uid = res.User.ID;
        const totalAmount = totalAmount;
        const [action1, promise1] = attachCustomerToOrder.createFetchAction({
          OrderID: orderID,
          UserID: uid,
        });

        store.dispatch(action1);

        const merchantAccount = `RIT-TST-GLOBAL`;

        promise1.then(
          result => {
            console.log('result aaya', result);
          },
          error => {
            console.log('error aaya', error);
          }
        );

        const token =
          'eyJsb2NhbGUiOiJlbl9VUyIsImRldmljZUlkZW50aWZpZXIiOiI2MzRCRTc2Ri02M0JFLTRBREItOEU0Qy1DMkUzNzgwMDVGMkEiLCJkZXZpY2VGaW5nZXJwcmludFZlcnNpb24iOiIxLjAiLCJwbGF0Zm9ybSI6ImlvcyIsImludGVncmF0aW9uIjoiY3VzdG9tIiwib3NWZXJzaW9uIjoiMTEuMiIsInNka1ZlcnNpb24iOiIxLjE2LjAiLCJhcGlWZXJzaW9uIjoiNiIsImRldmljZU1vZGVsIjoieDg2XzY0In0=';

        const x = {
          OrderID: orderID,
          Code: 'ADYEN_CHECKOUT',
          Amount: totalAmount,
          Properties: {
            MerchantAccount: merchantAccount, // Receive that from GetApplicationConfiguration.Configuration.Adyen:MerchantAccount,
            Channel: 2, // Web = 1, iOS = 2, Android = 3
            ReturnUrl: 'adpay', // The custom schema of the app
            Token: token,
          },
        };

        const [action2, promise2] = createPayment.createFetchAction(x);

        store.dispatch(action2);

        promise2.then(
          result1 => {
            console.clear();

            const { Properties } = result1;
            const { Data } = Properties;
            const { paymentMethods } = Data;

            const idealTypeMethods = paymentMethods.find(
              item => item.type === 'ideal'
            );
            console.log('result1', idealTypeMethods.inputDetails[0].items);
            RNAdyen.setPaymentData(Data);
            this.setState({
              idealMethods: idealTypeMethods.inputDetails[0].items,
              isLoading: false,
            });
          },
          error1 => {
            console.log('error1', error1);
            error1.json().then(data1 => {
              console.log('errorData1', data1);
            });
          }
        );
      },
      error => {
        error.json().then(eRRORdata => {
          console.log('eRRORdata', eRRORdata);
        });
      }
    );
  };

  componentDidMount() {
    RNAdyen.initializeAdyen();
    RNAdyen.RNEventEmitter.addListener('getToken', token => {
      console.log('My TOken', token);

      this.onSetPaymentData();
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

    RNAdyen.RNEventEmitter.addListener('getRedirectUrlForIdeal', url => {
      console.log('getRedirectUrlForIdeal', url);
      Linking.openURL(url);
    });
  }

  componentWillUnmount() {
    RNAdyen.RNEventEmitter.removeAllListeners();
  }

  onSetPaymentData = () => {
    const [
      applicationConfigurationAction,
      promise,
    ] = getApplicationConfiguration.createFetchAction();
    store.dispatch(applicationConfigurationAction);

    promise
      .then(res => {
        console.log(res, 'Contifrguration');
        const [action, promise1] = addProductToOrder.createFetchAction({
          ProductID: 177653,
          QuantityOrdered: 1,
          LineActionType: 4,
        });

        store.dispatch(action);

        promise1.then(response => {
          console.log(response, 'addProdumct to order');
          const { ShoppingCart, TotalAmountInTax } = response;
          this.createCustomers(ShoppingCart.ID, TotalAmountInTax);
        });
      })
      .catch(err => console.log(err));
  };

  // onSetCardDetails = () => {
  //   RNAdyen.setCardDetails({
  //     name: 'Renga',
  //     number: '4111111111111111',
  //     expiryDate: '08/18',
  //     cvc: '737',
  //     shouldSave: true,
  //   });
  // };

  onSetPaymentMethods = idealId => {
    RNAdyen.setPaymentMethod('ideal', idealId);
  };

  render() {
    const { idealMethods, isLoading } = this.state;

    console.log(idealMethods, 'Idela Methis');

    return (
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <ScrollView style={{ paddingHorizontal: 30 }}>
            <Text style={styles.header}>iDeal methods</Text>
            {idealMethods.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.button}
                onPress={() => this.onSetPaymentMethods(item.id)}
              >
                <Image style={styles.img} source={{ uri: item.imageUrl }} />
                <Text style={styles.instructions}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 30,
    textAlign: 'center',
    paddingVertical: 30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  welcome: {
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
  img: {
    width: 50,
    height: 50,
    marginHorizontal: 15,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 20,
    marginBottom: 5,
  },
});
