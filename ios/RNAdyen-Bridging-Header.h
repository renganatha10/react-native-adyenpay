//  Created by react-native-create-bridge
// RNAdyen-Bridging-Header.h


// import RCTEventEmitter
#if __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#elif __has_include(“RCTEventEmitter.h”)
#import “RCTEventEmitter.h”
#else
#import “React/RCTEventEmitter.h” // Required when used as a Pod in a Swift project
#endif

// import RCTBridgeModule
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include(“RCTBridgeModule.h”)
#import “RCTBridgeModule.h”
#else
#import “React/RCTBridgeModule.h” // Required when used as a Pod in a Swift project
#endif

#if __has_include(<React/RCTBridge>)
#import <React/RCTBridge>
#elif __has_include(“RCTBridge”)
#import “RCTBridge”
#else
#import “React/RCTBridge” // Required when used as a Pod in a Swift project
#endif


#if __has_include(<React/RCTEventDispatcher>)
#import <React/RCTEventDispatcher>
#elif __has_include(“RCTEventDispatcher”)
#import “RCTEventDispatcher”
#else
#import “React/RCTEventDispatcher” // Required when used as a Pod in a Swift project
#endif




