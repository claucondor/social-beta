// Gifts.cdc
//
// This contract manages the escrow and verification process for on-chain gifts
// between users of the Clandestine Network. It is designed to hold funds
// securely until the recipient provides proof of delivery.

import "FungibleToken"
import "FlowToken" // Example, could be FUSD or another token

access(all) contract Gifts {

    // --- Events ---
    access(all) event GiftOffered(giftID: UInt64, from: Address, to: Address, amount: UFix64)
    access(all) event GiftConfirmed(giftID: UInt64, by: Address, proofHash: String)
    access(all) event GiftCompleted(giftID: UInt64, to: Address, amount: UFix64)
    access(all) event GiftCancelled(giftID: UInt64, by: Address)

    // --- Contract State ---
    access(all) var totalGifts: UInt64

    // The core resource that holds the gift details and escrowed funds.
    access(all) resource Gift {
        pub let id: UInt64
        pub let sender: Address
        pub let recipient: Address
        pub let amount: UFix64
        pub var proofHash: String?
        pub var state: String // "offered", "confirmed", "completed", "cancelled"

        // The vault to hold the escrowed tokens
        pub let escrow: @FungibleToken.Vault

        init(sender: Address, recipient: Address, escrowVault: @FungibleToken.Vault) {
            self.id = Gifts.totalGifts
            self.sender = sender
            self.recipient = recipient
            self.amount = escrowVault.balance
            self.proofHash = nil
            self.state = "offered"
            self.escrow <- escrowVault
        }

        // The recipient provides proof of delivery
        pub fun confirm(proofHash: String, by: Address) {
            pre {
                self.state == "offered": "Gift is not in a state to be confirmed."
                by == self.recipient: "Only the recipient can confirm a gift."
            }
            self.proofHash = proofHash
            self.state = "confirmed"
            emit GiftConfirmed(giftID: self.id, by: by, proofHash: proofHash)
        }

        // The sender verifies the proof and releases the funds
        pub fun complete(by: Address): @FungibleToken.Vault {
            pre {
                self.state == "confirmed": "Gift has not been confirmed by the recipient yet."
                by == self.sender: "Only the sender can complete the gift."
                self.proofHash != nil: "Proof of delivery is missing."
            }
            self.state = "completed"
            emit GiftCompleted(giftID: self.id, to: self.recipient, amount: self.amount)
            return <- self.escrow
        }

        // Either party can cancel before completion (funds returned to sender)
        pub fun cancel(by: Address): @FungibleToken.Vault {
            pre {
                self.state == "offered" || self.state == "confirmed": "Gift is already completed or cancelled."
                by == self.sender || by == self.recipient: "Only the sender or recipient can cancel the gift."
            }
            self.state = "cancelled"
            emit GiftCancelled(giftID: self.id, by: by)
            return <- self.escrow
        }
    }

    // --- Gift Management ---
    // Gifts are stored centrally in the contract account
    access(self) var pendingGifts: @{UInt64: Gift}

    // --- Public Functions ---
    
    // The sender calls this to initiate a gift, depositing funds into escrow.
    pub fun offerGift(to: Address, funds: @FungibleToken.Vault) {
        let sender = funds.owner!.address
        let gift <- create Gift(sender: sender, recipient: to, escrowVault: <-funds)
        
        Gifts.totalGifts = Gifts.totalGifts + 1
        
        emit GiftOffered(giftID: gift.id, from: sender, to: to, amount: gift.amount)
        
        let oldGift <- self.pendingGifts[gift.id] <- gift
        destroy oldGift
    }

    // The recipient calls this to submit their proof.
    pub fun confirmGift(giftID: UInt64, proofHash: String, by: Address) {
        let gift = self.borrowGift(giftID: giftID)
        gift.confirm(proofHash: proofHash, by: by)
    }

    // The sender calls this to release the funds.
    pub fun completeGift(giftID: UInt64, by: Address): @FungibleToken.Vault {
        let gift <- self.pendingGifts.remove(key: giftID) ?? panic("Gift not found")
        let funds <- gift.complete(by: by)
        destroy gift
        return <- funds
    }

    // A public function to cancel a gift.
    pub fun cancelGift(giftID: UInt64, by: Address): @FungibleToken.Vault {
        let gift <- self.pendingGifts.remove(key: giftID) ?? panic("Gift not found")
        let funds <- gift.cancel(by: by)
        destroy gift
        return <- funds
    }

    // --- Helper Functions ---
    access(all) view fun getGiftDetails(giftID: UInt64): &Gift? {
        return &self.pendingGifts[giftID] as &Gift?
    }

    access(self) fun borrowGift(giftID: UInt64): &Gift {
        return &self.pendingGifts[giftID] as &Gift? ?? panic("Gift not found")
    }

    init() {
        self.totalGifts = 0
        self.pendingGifts <- {}
    }
} 