// forge_bond.cdc
//
// This transaction forges a new "Corazón Clandestino" between two Emisarios
// by calling the ClandestineNetwork contract. It then distributes the two
// resulting ClaimTicket NFTs to the respective owners.

import "NonFungibleToken"
import "ClandestineNetwork"

transaction(partnerAddress: Address) {

    // The Emisario resource of the transaction signer (the initiator)
    let initiatorEmisarioRef: &ClandestineNetwork.Emisario
    
    // The NFT Collection for ClaimTickets of the transaction signer
    let initiatorCollectionRef: &{NonFungibleToken.Collection}

    // The public capability to the partner's ClaimTicket Collection
    let partnerCollectionCap: Capability<&{NonFungibleToken.Collection}>

    prepare(initiator: auth(Storage, Capabilities) &Account) {
        // --- Initiator Setup ---
        self.initiatorEmisarioRef = initiator.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Initiator's Emisario resource not found. Please run setup_account.cdc")

        self.initiatorCollectionRef = initiator.storage.borrow<&{NonFungibleToken.Collection}>(from: ClandestineNetwork.ClaimCollectionStoragePath)
            ?? panic("Initiator's ClaimTicket Collection not found. Please run setup_account.cdc")

        // --- Partner Setup ---
        self.partnerCollectionCap = getAccount(partnerAddress).capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath)
        
        if !self.partnerCollectionCap.check() {
            panic("Partner's ClaimTicket Collection capability is not valid or has not been published.")
        }
    }

    execute {
        // --- Forge the Bond using the simplified version ---
        let tickets <- ClandestineNetwork.forgeBondSimple(
            emisario1: self.initiatorEmisarioRef,
            owner1: self.initiatorEmisarioRef.owner!.address,
            owner2: partnerAddress
        )

        log("New Corazón Clandestino forged. Distributing Claim Tickets...")

        // --- Distribute the Claim Tickets ---
        
        // Deposit the partner's ticket
        let partnerCollection = self.partnerCollectionCap.borrow()
            ?? panic("Could not borrow partner's collection.")
        partnerCollection.deposit(token: <- tickets.removeFirst())
        log("Deposited Claim Ticket in partner's collection.")

        // Deposit the initiator's ticket
        self.initiatorCollectionRef.deposit(token: <- tickets.removeFirst())
        log("Deposited Claim Ticket in initiator's collection.")

        // The array should be empty now
        destroy tickets
        
        log("Bond forged successfully!")
    }
} 