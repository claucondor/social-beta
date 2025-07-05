// set_public_key.cdc
//
// This transaction allows a user to set or update the public encryption key
// associated with their Emisario resource. This key is then used by others
// to encrypt messages sent to this user.

import ClandestineNetworkV2 from 0x2444e6b4d9327f09

transaction(newPublicKey: String) {

    let emisarioRef: &ClandestineNetworkV2.Emisario

    prepare(signer: auth(Storage) &Account) {
        self.emisarioRef = signer.storage.borrow<&ClandestineNetworkV2.Emisario>(from: /storage/ClandestineEmisarioV2)
            ?? panic("Emisario resource not found. Please run setup_account.cdc first")
    }

    execute {
        self.emisarioRef.setPublicKey(newKey: newPublicKey)
        log("Public encryption key has been set/updated successfully.")
    }
} 