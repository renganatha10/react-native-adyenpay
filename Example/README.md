# React Native Bridging For Adyen-IOS

## Set Up
  * `npm install`
  * `cd ios Pod install` 
  * `cd..`
  * `react-native run-ios`


### Methods and Events
  ### Methods
     initializeAdyen()
     setPaymentData(responseFromBackend)
     setCardDetails({ name, cvc, expiryDate, shouldSave, number })
     setPaymentMethod(typeOfPayment)
  ### Events
     getToken - Gives the Token From SDK
     getPreferredMethods - List All The Payment Methods
     paymentResult - Finally, Results
    
