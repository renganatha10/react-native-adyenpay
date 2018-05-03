//
//  RNAdyen.swift
//  RNAdyen
//
//  Created by Renga on 5/3/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

//  Created by react-native-create-bridge

import Foundation
import Adyen
import AdyenCSE

@objc(RNAdyen)
class RNAdyen: RCTEventEmitter, PaymentRequestDelegate {
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    override func supportedEvents() -> [String]! {
        return ["getToken", "getPreferredMethods", "paymentResult", "getRedirectUrlForIdeal"]
    }
    
    func paymentRequest(_ request: PaymentRequest, requiresPaymentDataForToken token: String, completion: @escaping DataCompletion) {
        if hasListeners {
            self.sendEvent(withName: "getToken", body: token)
        }
        dataComplete =  completion
    }
    
    func paymentRequest(_ request: PaymentRequest, requiresPaymentMethodFrom preferredMethods: [PaymentMethod]?, available availableMethods: [PaymentMethod], completion: @escaping MethodCompletion) {
        gloabalPreferedMethods = preferredMethods
        globalAvailableMethods = availableMethods
        methodComplete = completion
    }
    
    func paymentRequest(_ request: PaymentRequest, requiresReturnURLFrom url: URL, completion: @escaping URLCompletion) {
        self.sendEvent(withName: "getRedirectUrlForIdeal", body: url.absoluteString)
        urlCompletion = completion
        
    }
    
    func paymentRequest(_ request: PaymentRequest, requiresPaymentDetails details: PaymentDetails, completion: @escaping PaymentDetailsCompletion) {
        if let method = request.paymentMethod, method.type == "card" {
            if let cardDetails = cardDetails,
                let cardData = cardDetails.cardData(forRequest: request),
                let publicKey = request.publicKey,
                let encryptedToken = ADYEncrypter.encrypt(cardData, publicKeyInHex: publicKey) {
                details.fillCard(token: encryptedToken, storeDetails: cardDetails.shouldStoreDetails)
                completion(details)
            } else {
                // This should be an edge case, so just fail gracefully.
                // If this becomes a common case, better handling needs to be implemented.
                request.cancel()
            }
        } else {
            
            details.fillIdeal(issuerIdentifier: idealString!)
            completion(details)
            // Do nothing. For now only handle cards.
        }
    }
    
    func paymentRequest(_ request: PaymentRequest, didFinishWith result: PaymentRequestResult) {
        
        var status = "None"
        
        switch result {
        case let .payment(payment):
            switch payment.status {
            case .received, .authorised:
                status = "success"
            case .error, .refused:
                status = "failure"
            case .cancelled:
                status = "cancelled"
            }
        case let .error(error):
            switch error {
            case .cancelled:
                status = "failure"
            default:
                status = "cancelled"
            }
        }
        
        self.sendEvent(withName: "paymentResult", body: status)
    }
    
    @objc func initializeAdyen() {
        request =  PaymentRequest(delegate: self)
        request?.start()
    }
    
    private struct CardDetails {
        let name: String
        let number: String
        let expiryMonth: String
        let expiryYear: String
        let cvc: String
        let shouldStoreDetails: Bool
        
        func cardData(forRequest request: PaymentRequest) -> Data? {
            guard let generationTime = request.generationTime else {
                return nil
            }
            
            let dateFormatter = DateFormatter()
            dateFormatter.locale = Locale(identifier: "en_US_POSIX")
            dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'"
            dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
            
            let generationDate = dateFormatter.date(from: generationTime)
            
            let card = ADYCard()
            card.generationtime = generationDate
            card.holderName = name
            card.number = number
            card.expiryMonth = expiryMonth
            card.expiryYear = expiryYear
            card.cvc = cvc
            return card.encode()
        }
    }
    
    private var request: PaymentRequest?
    private var dataComplete: DataCompletion?
    private var methodComplete: MethodCompletion?
    private var globalAvailableMethods: [PaymentMethod]?
    private var gloabalPreferedMethods: [PaymentMethod]?
    private var cardDetails: CardDetails?
    private var urlCompletion: URLCompletion?
    private var idealString: String?
    private var hasListeners = false
    
    func setCardDetailsForCurrentRequest(name: String, number: String, expiryDate: String, cvc: String, shouldSave: Bool) {
        guard expiryDate.count == 5 else {
            // Do nothing if expiry date is in invalid format.
            return
        }
        
        var index = expiryDate.index(expiryDate.startIndex, offsetBy: 2)
        let monthString = expiryDate.substring(to: index)
        
        index = expiryDate.index(expiryDate.startIndex, offsetBy: 3)
        let yearString = "20\(expiryDate.substring(from: index))"
        
        cardDetails = CardDetails(name: name, number: number, expiryMonth: monthString, expiryYear: yearString, cvc: cvc, shouldStoreDetails: shouldSave)
    }
    
    @objc(setPaymentData:)
    func setPaymentData(myDictionary: NSDictionary) {
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: myDictionary)
            dataComplete!(jsonData)
        } catch {
            print("something went wrong with parsing json")
        }
    }
    
    @objc(setCardDetails:)
    func setCardDetails(cardDetails: NSDictionary) {
        
        let name = cardDetails.value(forKeyPath: "name")
        let number = cardDetails.value(forKeyPath: "number")
        let expiryDate = cardDetails.value(forKeyPath: "expiryDate")
        let cvc = cardDetails.value(forKeyPath: "cvc")
        let shouldSave = cardDetails.value(forKeyPath: "shouldSave")
        
        setCardDetailsForCurrentRequest(name: name as! String, number: number as! String, expiryDate: expiryDate as! String, cvc: cvc as! String, shouldSave: (shouldSave != nil))
        
    }
    
    
    func filterPaymentMethod(methodName: String) -> PaymentMethod {
        var myDesiredPaymentMethod: PaymentMethod = globalAvailableMethods![0]
        if let i = globalAvailableMethods?.index(where: { $0.type == methodName }) {
            myDesiredPaymentMethod = globalAvailableMethods![i]
        }
        return myDesiredPaymentMethod;
    }
    
    @objc(setPaymentMethodForIdeal:idealId:)
    func setPaymentMethodForIdeal(methodName: String, idealId: String) {
        idealString = idealId
        methodComplete!(filterPaymentMethod(methodName: methodName))
    }
    
    @objc(setPaymentMethodForCard:)
    func setPaymentMethodForCard(methodName: String) {
        methodComplete!(filterPaymentMethod(methodName: methodName))
    }
    
    @objc(setURLCompletion:)
    func setURLCompletion(url: String) {
        urlCompletion?(URL(string: url)!)
    }
}

