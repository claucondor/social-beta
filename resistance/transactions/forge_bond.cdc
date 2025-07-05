// forge_bond.cdc
//
// This transaction forges a new "Corazón Clandestino" between two Emisarios
// by calling the ClandestineNetwork contract. It then distributes the two
// resulting ClaimTicket NFTs to the respective owners.

import ClandestineNetworkV2 from 0x2444e6b4d9327f09
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction(partnerAddress: Address) {

    // The Emisario resource of the transaction signer (the initiator)
    let initiatorEmisarioRef: &ClandestineNetworkV2.Emisario
    
    // The NFT Collection for ClaimTickets of the transaction signer
    let initiatorCollectionRef: &ClandestineNetworkV2.Collection

    prepare(signer: auth(Storage) &Account) {
        // --- Initiator Setup ---
        self.initiatorCollectionRef = signer.storage.borrow<&ClandestineNetworkV2.Collection>(from: /storage/ClandestineClaimCollectionV2)
            ?? panic("Initiator does not have a ClaimTicket collection.")

        self.initiatorEmisarioRef = signer.storage.borrow<&ClandestineNetworkV2.Emisario>(from: /storage/ClandestineEmisarioV2)
            ?? panic("Initiator does not have an Emisario resource.")
    }

    execute {
        // --- Forge the Bond using the simplified version ---
        let tickets <- ClandestineNetworkV2.forgeBondSimple(
            emisario1: self.initiatorEmisarioRef,
            owner1: self.initiatorCollectionRef.owner!.address,
            owner2: partnerAddress
        )

        log("New Corazón Clandestino forged. Distributing Claim Tickets...")

        // --- Distribute the Claim Tickets ---
        
        // Deposit the partner's ticket
        let partnerAccount = getAccount(partnerAddress)
        let partnerCollection = partnerAccount.capabilities.get<&{NonFungibleToken.Collection}>(/public/ClandestineClaimCollectionV2).borrow()
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