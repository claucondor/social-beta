// setup_account.cdc
//
// This transaction sets up a user's account to participate in the Clandestine Network.
// It creates and saves two essential resources to the user's storage:
// 1. Emisario: Stores the user's profile, level, XP, and skill tree progression.
// 2. Collection: An NFT collection to hold the "ClaimTicket" NFTs, which prove
//    co-ownership of a Vinculo.

import ClandestineNetworkV2 from 0x2444e6b4d9327f09
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction {

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Use specific paths for V2 to avoid collisions
        let emisarioStoragePath = /storage/ClandestineEmisarioV2
        let emisarioPublicPath = /public/ClandestineEmisarioV2
        let claimCollectionStoragePath = /storage/ClandestineClaimCollectionV2
        let claimCollectionPublicPath = /public/ClandestineClaimCollectionV2
        
        // Create new Emisario V2
        let newEmisario <- ClandestineNetworkV2.createEmisario()
        
        // Store it in the account using V2 path
        signer.storage.save(<-newEmisario, to: emisarioStoragePath)
        
        // Create a public capability for the Emisario
        let emisarioPublicCap = signer.capabilities.storage.issue<&{ClandestineNetworkV2.EmisarioPublic}>(emisarioStoragePath)
        signer.capabilities.publish(emisarioPublicCap, at: emisarioPublicPath)
        
        // Create ClaimTicket collection if it doesn't exist
        if signer.storage.borrow<&ClandestineNetworkV2.Collection>(from: claimCollectionStoragePath) == nil {
            let collection <- ClandestineNetworkV2.createEmptyCollection()
            signer.storage.save(<-collection, to: claimCollectionStoragePath)
            
            // Create a public capability for the collection
            let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(claimCollectionStoragePath)
            signer.capabilities.publish(collectionCap, at: claimCollectionPublicPath)
        }
    }

    execute {
        log("Account setup completed successfully")
    }
} 