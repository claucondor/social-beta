import ClandestineNetworkV2 from 0x2444e6b4d9327f09
import NonFungibleToken from 0x631e88ae7f1d7c20

access(all) fun main(userAddress: Address): {String: AnyStruct} {
    let account = getAccount(userAddress)
    
    // Check if user has Emisario V2
    var hasEmisario = false
    var emisarioData: {String: AnyStruct} = {}
    
    // Try to get V2 Emisario first
    if let emisarioRef = account.capabilities.get<&{ClandestineNetworkV2.EmisarioPublic}>(/public/ClandestineEmisarioV2).borrow() {
        hasEmisario = true
        emisarioData = {
            "encryptionPubKey": emisarioRef.encryptionPubKey,
            "hasPublicKey": emisarioRef.encryptionPubKey.length > 0,
            "level": emisarioRef.level,
            "id": emisarioRef.id
        }
    }
    
    // Check if user has Collection V2 via public capability
    var hasCollection = false
    var collectionData: {String: AnyStruct} = {}
    
    if let collectionRef = account.capabilities.get<&{NonFungibleToken.Collection}>(/public/ClandestineClaimCollectionV2).borrow() {
        hasCollection = true
        collectionData = {
            "length": collectionRef.getLength(),
            "ids": collectionRef.getIDs()
        }
    }
    
    // Check public capabilities
    var hasPublicCollection = false
    let publicCollectionCap = account.capabilities.get<&{NonFungibleToken.Collection}>(/public/ClandestineClaimCollectionV2)
    if publicCollectionCap.check() {
        hasPublicCollection = true
    }
    
    // User is fully setup if they have both Emisario and Collection
    let isSetup = hasEmisario && hasPublicCollection
    
    return {
        "address": userAddress.toString(),
        "hasEmisario": hasEmisario,
        "hasCollection": hasCollection,
        "hasPublicCollection": hasPublicCollection,
        "emisarioData": emisarioData,
        "collectionData": collectionData,
        "isFullySetup": isSetup,
        "version": "V2"
    }
} 