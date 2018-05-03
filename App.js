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
      paymentMethods: [],
      pageView: 0,
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
        const uid = res.User.ID;
        const totalAmount = totalAmount;
        const [action1, promise1] = attachCustomerToOrder.createFetchAction({
          OrderID: orderID,
          UserID: uid,
        });

        store.dispatch(action1);

        const merchantAccount = `RIT-TST-GLOBAL`;

        const token =
          'eyJkZXZpY2VGaW5nZXJwcmludFZlcnNpb24iOiIxLjEiLCJwbGF0Zm9ybSI6ImFuZHJvaWQiLCJhcGlWZXJzaW9uIjoiNiIsIm9zVmVyc2lvbiI6MjUsInNka1ZlcnNpb24iOiIxLjE0LjEiLCJkZXZpY2VJZGVudGlmaWVyIjoiOWQ0OWZmZDdjZDNhMWNhZSIsImxvY2FsZSI6ImVuX0lOIiwiaW50ZWdyYXRpb24iOiJjdXN0b20iLCJkZXZpY2VNb2RlbCI6Im1vdG9yb2xhIGhhcnBpYSJ9';

        const x = {
          OrderID: orderID,
          Code: 'ADYEN_CHECKOUT',
          Amount: totalAmount,
          Properties: {
            MerchantAccount: merchantAccount, // Receive that from GetApplicationConfiguration.Configuration.Adyen:MerchantAccount,
            Channel: 2, // Web = 1, iOS = 2, Android = 3
            ReturnUrl: 'adpay://', // The custom schema of the app
            Token: token,
          },
        };

        const [action2, promise2] = createPayment.createFetchAction(x);

        store.dispatch(action2);

        promise2
          .then(result1 => {
            const { Properties } = result1;
            const { Data } = Properties;

            console.log(Data, 'Data From The Create Fetch Action Methods');
            const { paymentMethods } = Data;

            const idealTypeMethods = paymentMethods.find(
              item => item.type === 'ideal'
            );
            RNAdyen.setPaymentData(Data);
            this.setState({
              paymentMethods: Data.paymentMethods,
              idealMethods: idealTypeMethods.inputDetails[0].items,
              isLoading: false,
            });
          })
          .catch(err1 => {
            console.log(err1, 'error1');
          });
      },
      error => {
        error.json().then(eRRORdata => {
          console.log('eRRORdata', eRRORdata);
        });
      }
    );
  };

  componentDidMount() {
    Linking.addEventListener('url', event => {
      RNAdyen.setURLCompletion(event.url);
    });
    RNAdyen.initializeAdyen();
    this.onSetPaymentData();
    RNAdyen.RNEventEmitter.addListener(
      'getPreferredMethods',
      paymentMethods => {
        console.log('getPreferredMethods', paymentMethods);
      }
    );
    RNAdyen.RNEventEmitter.addListener('paymentResult', result => {
      console.log('paymentResult', result);
      alert(result);
    });

    RNAdyen.RNEventEmitter.addListener('getRedirectUrlForIdeal', url => {
      console.log('getRedirectUrlForIdeal', url);
      Linking.openURL(url);
    });
  }

  onSetPaymentData = () => {
    const [
      applicationConfigurationAction,
      promise,
    ] = getApplicationConfiguration.createFetchAction();
    store.dispatch(applicationConfigurationAction);

    promise
      .then(res => {
        const [action, promise1] = addProductToOrder.createFetchAction({
          ProductID: 177653,
          QuantityOrdered: 1,
          LineActionType: 4,
        });

        store.dispatch(action);

        promise1.then(response => {
          const { ShoppingCart, TotalAmountInTax } = response;
          this.createCustomers(ShoppingCart.ID, TotalAmountInTax);
        });
      })
      .catch(err => console.log(err));
  };

  onSetCardDetails = type => {
    let cardDetails = {};
    if (type === 'mc') {
      cardDetails = {
        name: 'Renga',
        number: '2223000048410010',
        expiryDate: '08/18',
        cvc: '737',
        shouldSave: true,
      };
    } else if (type === 'visa') {
      cardDetails = {
        name: 'Renga',
        number: '4111111111111111',
        expiryDate: '08/18',
        cvc: '737',
        shouldSave: true,
      };
    } else if (type === 'amex') {
      cardDetails = {
        name: 'Renga',
        number: '370000000000002',
        expiryDate: '08/18',
        cvc: '7373',
        shouldSave: true,
      };
    } else if (type === 'maestro') {
      cardDetails = {
        name: 'Renga',
        number: '4111111111111111',
        expiryDate: '08/18',
        cvc: '737',
        shouldSave: true,
      };
    } else if (type === 'diners') {
      cardDetails = {
        name: 'Renga',
        number: '36006666333344',
        expiryDate: '08/18',
        cvc: '737',
        shouldSave: true,
      };
    } else if (type === 'discover') {
      cardDetails = {
        name: 'Renga',
        number: '6445644564456445',
        expiryDate: '08/18',
        cvc: '737',
        shouldSave: true,
      };
    }

    RNAdyen.setCardDetails(cardDetails);
  };

  onSetPaymentMethods = item => {
    if (item.type === 'ideal') {
      this.onSetPaymentMethodsForIdeal('1121');
    } else if (item.group && item.group.type === 'card') {
      this.onSetCardDetails(item.type);
      this.onSetPaymentMethodsForCards('card');
    }
  };

  onSetPaymentMethodsForCards = methodName => {
    RNAdyen.setPaymentMethodForCard(methodName);
  };

  onSetPaymentMethodsForIdeal = id => {
    RNAdyen.setPaymentMethodForIdeal('ideal', id);
  };

  render() {
    const { idealMethods, isLoading, paymentMethods } = this.state;

    console.log(paymentMethods, 'paymentMethods');

    return (
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <ScrollView style={{ paddingHorizontal: 30 }}>
            <Text style={styles.header}>Payment Methods</Text>
            {paymentMethods.map(item => {
              console.log(
                item.group && item.group.type === 'card' ? item.type : ''
              );
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.button}
                  onPress={() => this.onSetPaymentMethods(item)}
                >
                  <Text style={styles.instructions}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
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
