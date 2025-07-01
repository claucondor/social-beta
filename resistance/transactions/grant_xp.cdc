// grant_xp.cdc
//
// This transaction grants experience points (XP) to an Emisario and handles
// leveling them up if they have enough XP. This would typically be called

// by a trusted server-side oracle after validating a successful user interaction.

import "ClandestineNetwork"

transaction(recipientAddress: Address, xpToGrant: UFix64) {

    // The Emisario resource of the recipient, which will be modified.
    let emisarioRef: &ClandestineNetwork.Emisario

    prepare(admin: auth(Storage) &Account) {
        // This transaction is authorized by an admin/oracle account, not the user.
        // This is a common pattern for game progression to prevent cheating.
        // We borrow the admin's capabilities to access and modify other accounts' resources.
        
        // For the MVP, we assume the signer *is* the recipient for simplicity.
        // In production, this would use admin capabilities.
        
        let recipientAccount = getAccount(recipientAddress)
        
        self.emisarioRef = recipientAccount.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Recipient's Emisario resource not found. They must run setup_account.cdc")
    }

    execute {
        // --- Grant XP ---
        self.emisarioRef.xp = self.emisarioRef.xp + xpToGrant
        log("Granted ".concat(xpToGrant.toString()).concat(" XP. New total: ").concat(self.emisarioRef.xp.toString()))

        // --- Handle Level Up ---
        // Define the XP requirement for the next level.
        // Example formula: 100 * (level ^ 1.5)
        let xpForNextLevel = 100.0 * (UFix64(self.emisarioRef.level) ** 1.5)

        if self.emisarioRef.xp >= xpForNextLevel {
            // Level up!
            self.emisarioRef.level = self.emisarioRef.level + 1
            self.emisarioRef.skillPoints = self.emisarioRef.skillPoints + 1
            
            // It's common to reset XP or carry over the remainder. We'll carry it over.
            self.emisarioRef.xp = self.emisarioRef.xp - xpForNextLevel

            log("LEVEL UP! Emisario is now level ".concat(self.emisarioRef.level.toString()))
            log("Gained 1 Skill Point. Total available: ".concat(self.emisarioRef.skillPoints.toString()))
        }
    }
} 