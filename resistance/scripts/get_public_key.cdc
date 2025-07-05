// get_public_key.cdc
//
// This script attempts to read the public encryption key of a specified user.
// Note: Currently returns nil as public key access is not implemented.

import ClandestineNetworkV2 from 0x2444e6b4d9327f09

access(all) fun main(userAddress: Address): String? {
    let account = getAccount(userAddress)
    
    // Try V2 first 
    if let emisarioRef = account.capabilities.get<&{ClandestineNetworkV2.EmisarioPublic}>(/public/ClandestineEmisarioV2).borrow() {
        return emisarioRef.encryptionPubKey.length > 0 ? emisarioRef.encryptionPubKey : nil
    }
    
    return nil
} 