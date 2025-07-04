import ClandestineNetwork from 0x2444e6b4d9327f09
import NonFungibleToken from 0x631e88ae7f1d7c20

access(all) fun main(userAddress: Address): {String: AnyStruct} {
    let account = getAccount(userAddress)
    
    // Check public capabilities instead of private storage
    var hasEmisario = false
    var emisarioData: {String: AnyStruct} = {}
    
    // Try to get public capability for Emisario (if it exists)
    // For now, we'll return basic info - in production you'd need public capabilities
    
    // Check if user has Collection via public capability
    var hasCollection = false
    var collectionData: {String: AnyStruct} = {}
    
    if let collectionRef = account.capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath).borrow() {
        hasCollection = true
        collectionData = {
            "length": collectionRef.getLength(),
            "ids": collectionRef.getIDs()
        }
    }
    
    // Check public capabilities
    var hasPublicCollection = false
    let publicCollectionCap = account.capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath)
    if publicCollectionCap.check() {
        hasPublicCollection = true
    }
    
    // For MVP, we'll consider user setup if they have public collection
    // In production, you'd need to add public capabilities for Emisario data
    let isSetup = hasPublicCollection
    
    return {
        "address": userAddress.toString(),
        "hasEmisario": isSetup,
        "hasCollection": hasCollection,
        "hasPublicCollection": hasPublicCollection,
        "emisarioData": emisarioData,
        "collectionData": collectionData,
        "isFullySetup": isSetup
    }
} 