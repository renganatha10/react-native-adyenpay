//  Created by react-native-create-bridge

import Foundation
import Adyen
import AdyenCSE


@objc(RNAdyen)
class RNAdyen :RCTEventEmitter, PaymentRequestDelegate  {
  
  override func supportedEvents() -> [String]! {
    return ["getToken"]
  }
  
  func paymentRequest(_ request: PaymentRequest, didFinishWith result: PaymentRequestResult) {
    print("I am FInisiehed");
  }
  
  func paymentRequest(_ request: PaymentRequest, requiresPaymentDataForToken token: String, completion: @escaping DataCompletion) {
    self.sendEvent(withName: "getToken", body: token)    
  }
  
  func paymentRequest(_ request: PaymentRequest, requiresPaymentMethodFrom preferredMethods: [PaymentMethod]?, available availableMethods: [PaymentMethod], completion: @escaping MethodCompletion) {
    print("preferredMethods");
  }
  
  func paymentRequest(_ request: PaymentRequest, requiresReturnURLFrom url: URL, completion: @escaping URLCompletion) {
    print(url, "preferredMethods");
  }
  
  func paymentRequest(_ request: PaymentRequest, requiresPaymentDetails details: PaymentDetails, completion: @escaping PaymentDetailsCompletion) {
    print(details, "PaymentDetails");
  }
  
  private let url = URL(string: "https://checkoutshopper-test.adyen.com/checkoutshopper/demoserver/setup")!
  
  
  @objc func initializeAdyen() {
   let  request = PaymentRequest(delegate: self)
    request.start();
  }
}




