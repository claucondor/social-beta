// setup_account.cdc
//
// This transaction sets up a user's account to participate in the Clandestine Network.
// It creates and saves two essential resources to the user's storage:
// 1. Emisario: Stores the user's profile, level, XP, and skill tree progression.
// 2. Collection: An NFT collection to hold the "ClaimTicket" NFTs, which prove
//    co-ownership of a Vinculo.

import "NonFungibleToken"
import "ClandestineNetwork"

transaction {

    prepare(signer: auth(Storage, Capabilities) &Account) {

        // 1. Set up the Emisario resource if it doesn't exist
        if signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath) == nil {
            let emisario <- ClandestineNetwork.createEmisario()
            signer.storage.save(<-emisario, to: ClandestineNetwork.EmisarioStoragePath)
            
            // Note: We are not creating a public capability for the Emisario resource
            // to keep player progression private by default. Scripts can read this
            // data from the owner's account directly if authorized.
            log("Emisario resource created and saved.")
        } else {
            log("Emisario resource already exists.")
        }

        // 2. Set up the ClaimTicket NFT Collection if it doesn't exist
        if signer.storage.borrow<&ClandestineNetwork.Collection>(from: ClandestineNetwork.ClaimCollectionStoragePath) == nil {
            let collection <- ClandestineNetwork.createEmptyCollection()
            signer.storage.save(<-collection, to: ClandestineNetwork.ClaimCollectionStoragePath)

            // Create a public capability for the collection.
            let cap = signer.capabilities.storage.issue<&{NonFungibleToken.CollectionPublic}>(ClandestineNetwork.ClaimCollectionStoragePath)
            signer.capabilities.publish(cap, at: ClandestineNetwork.ClaimCollectionPublicPath)
            
            log("ClaimTicket NFT Collection created and capability published.")
        } else {
            log("ClaimTicket NFT Collection already exists.")
        }
    }

    execute {
        log("Account setup for the Clandestine Network is complete.")
    }
} 