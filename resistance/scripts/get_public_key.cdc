// get_public_key.cdc
//
// This script reads the public encryption key of a specified user
// by calling the public view function on the ClandestineNetwork contract.

import "ClandestineNetwork"

access(all) fun main(userAddress: Address): String? {
    
    return ClandestineNetwork.getEmisarioPublicKey(address: userAddress)
} 