// set_public_key.cdc
//
// This transaction allows a user to set or update the public encryption key
// associated with their Emisario resource. This key is then used by others
// to encrypt messages sent to this user.

import "ClandestineNetwork"

transaction(newPublicKey: String) {

    let emisarioRef: &ClandestineNetwork.Emisario

    prepare(signer: auth(Storage) &Account) {
        self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Emisario resource not found. Please run setup_account.cdc")
    }

    execute {
        self.emisarioRef.setPublicKey(newKey: newPublicKey)
        log("Public encryption key has been set/updated successfully.")
    }
} 