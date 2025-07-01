// confirm_gift.cdc
//
// This transaction is called by the RECIPIENT of a gift to confirm
// they have received it and to provide proof of delivery.

import "Gifts"

transaction(giftID: UInt64, proofHash: String) {

    prepare(recipient: auth(Storage) &Account) {
        // This transaction is signed by the recipient of the gift.
        // The Gifts contract will verify that the signer's address
        // matches the recipient address stored in the Gift resource.
    }

    execute {
        // Call the public function on the Gifts contract to confirm delivery.
        Gifts.confirmGift(giftID: giftID, proofHash: proofHash, by: recipient.address)

        log("Gift #".concat(giftID.toString()).concat(" has been confirmed by the recipient."))
        log("Proof hash: ".concat(proofHash))
        log("The sender can now verify the proof and complete the gift.")
    }
} 