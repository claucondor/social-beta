// complete_gift.cdc
//
// This transaction is called by the SENDER of a gift after the recipient
// has confirmed delivery. It verifies the proof (off-chain) and releases
// the escrowed funds to the recipient.

import "FungibleToken"
import "FlowToken" // Using FLOW as the example gift currency
import "Gifts"

transaction(giftID: UInt64) {

    let fundsReceiver: Capability<&{FungibleToken.Receiver}>
    let senderAddress: Address

    prepare(sender: auth(Storage, Capabilities) &Account) {
        self.senderAddress = sender.address

        // Get the recipient's address from the gift details to get their receiver capability.
        let giftDetails = Gifts.getGiftDetails(giftID: giftID)
            ?? panic("Gift with the specified ID does not exist.")
        let recipientAddress = giftDetails.recipient

        // Get the recipient's public capability to receive FLOW.
        self.fundsReceiver = getAccount(recipientAddress).capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        
        if !self.fundsReceiver.check() {
            panic("Recipient's FLOW receiver capability is not valid or has not been published.")
        }
    }

    execute {
        // Complete the gift, which returns the escrowed vault.
        let escrowedVault <- Gifts.completeGift(giftID: giftID, by: self.senderAddress)

        let amount = escrowedVault.balance
        log("Gift #".concat(giftID.toString()).concat(" proof verified by sender."))
        log("Releasing ".concat(amount.toString()).concat(" FLOW to recipient."))

        // Deposit the funds into the recipient's vault.
        self.fundsReceiver.borrow()!.deposit(from: <-escrowedVault)

        log("Gift successfully completed.")

        // FUTURE: This is where we would call another transaction or contract
        // to grant Bond Points to the Vínculo shared by the sender and recipient.
        // e.g., ClandestineNetwork.grantBondPoints(sender: self.senderAddress, recipient: recipientAddress, points: 250.0)
    }
} 