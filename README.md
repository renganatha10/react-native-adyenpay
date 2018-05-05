
# react-native-adyen

## Getting started

`$ npm install react-native-adyenpay --save`

### Installation

`$ react-native link react-native-adyen`


#### iOS

create Podfile in ios with following content

      platform :ios, '9.0'
      use_frameworks!
	  target 'Your Target Name' do
		  pod 'Adyen',
	  end
    		
      post_install do |installer|
        installer.pods_project.targets.each do |target|
          if target.name == 'Adyen'
            target.build_configurations.each do |config|
              config.build_settings['SWIFT_VERSION'] = '4.0'
            end
          end
        end
      end


run `pod install`

open YourProject.xcworkspace/

create a group `RNAdyen` under your project *top level* and add files under directory node_modules/react-native-adyen/ios/ReactNativeCharts

choose Group ForBeginner, create a empty swift file, the xcode will prompt creating a bridging file, let's name it `YourProject-Bridging-Header.h`


replace content with 

    #import <React/RCTEventEmitter.h>
    #import <React/RCTBridgeModule.h>
    #import <React/RCTBridge.h>
    #import <React/RCTEventDispatcher.h>

set `YourProject-Bridging-Header.h` in `Build Settings -> Swift Compiler - General -> Object-C Bridging Header`   

set `No` in `Build Settings -> Swift Compiler - Version -> User Legacy Swift Language Version` 

click run  or use `react-native run-ios`
That is all.

#### Android
 `react-native link react-native-adyen` should install all the dependency

## Usage


```import RNAdyen from react-native-adyenpay```

Considering you want to Build Custom UI using Adyen

### Methods and Events
  ### Methods
     initializeAdyen() - To Initialize the Adyen
     setPaymentData(responseFromBackend) - Consider Your calling the API from Javascript Side
     setCardDetails({ name, cvc, expiryDate, shouldSave, number })
     setPaymentMethodForIdeal('ideal', idealId)
	 setPaymentMethodsForCard('card')
	 setURLCompletion() - Call the function after payment redirection to your app (redirection based payment)
  ### Events
     getToken - Gives the Token From SDK     
	 getRedirectUrlForIdeal - return Redirect URL from Adyen
     paymentResult - Finally, Results
	 
  