// offer_gift.cdc
//
// This transaction allows a user to offer a gift to another user by depositing
// Fungible Tokens into the Gifts contract escrow.

import "FungibleToken"
import "FlowToken" // Using FLOW as the example gift currency
import "Gifts"

transaction(amount: UFix64, recipient: Address) {

    // The vault that holds the sender's FLOW tokens
    let sentVault: @FungibleToken.Vault

    prepare(sender: auth(Storage, Capabilities) &Account) {
        // Get a reference to the sender's FLOW vault
        let vaultRef = sender.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's FLOW vault")

        // Withdraw the specified amount from the sender's vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        // Offer the gift by moving the withdrawn funds into the Gifts contract
        Gifts.offerGift(to: recipient, funds: <-self.sentVault)

        log("Successfully offered a gift of ".concat(amount.toString()).concat(" FLOW to ").concat(recipient.toString()))
    }
} 