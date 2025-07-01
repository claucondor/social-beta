// update_bond.cdc
//
// This transaction updates the state of a Vínculo (Bond) after a successful
// interaction, such as a message reply. It grants Bond Points and handles
// the leveling up of the relationship. This would be called by a trusted
// server-side oracle.

import "ClandestineNetwork"

transaction(bondID: UInt64, pointsToAdd: UFix64) {

    // A reference to the Vínculo resource that will be modified.
    // This requires access to the central BondVault.
    let bondRef: &ClandestineNetwork.Vínculo

    prepare(admin: auth(Storage) &Account) {
        // This transaction must be signed by an account with access to the BondVault,
        // typically the contract's admin account.
        
        let vaultRef = admin.storage.borrow<&ClandestineNetwork.BondVault>(from: /storage/ClandestineBondVault)
            ?? panic("Could not borrow a reference to the BondVault")
            
        self.bondRef = vaultRef.borrowVínculo(id: bondID)
            ?? panic("Bond with the specified ID not found in the vault")
    }

    execute {
        // --- Grant Bond Points ---
        self.bondRef.messagesExchanged = self.bondRef.messagesExchanged + 1
        self.bondRef.bondPoints = self.bondRef.bondPoints + pointsToAdd
        log("Granted ".concat(pointsToAdd.toString()).concat(" Bond Points to Vínculo #").concat(self.bondRef.id.toString()))
        log("New total: ".concat(self.bondRef.bondPoints.toString()))

        // --- Handle Bond Level Up ---
        // The logic for leveling up a bond could be stored on-chain in the future.
        // For the MVP, we'll hardcode the level requirements.
        let xpForNextLevel = self.getBondXPForLevel(level: self.bondRef.bondLevel + 1)

        if self.bondRef.bondPoints >= xpForNextLevel {
            // Level up the bond!
            self.bondRef.bondLevel = self.bondRef.bondLevel + 1
            
            // We don't reset or consume bond points; they are a lifetime measure of the relationship's strength.

            log("BOND LEVEL UP! Vínculo #".concat(self.bondRef.id.toString()).concat(" is now level ").concat(self.bondRef.bondLevel.toString()))

            // Emit an event to notify off-chain systems that the Vínculo has evolved.
            // This can trigger the AI to write the next chapter of the story, update the
            // generative art, and unlock new abilities for the pair.
            emit ClandestineNetwork.BondEvolved(
                bondID: self.bondRef.id,
                newLevel: self.bondRef.bondLevel,
                messages: self.bondRef.messagesExchanged
            )
        }
    }

    fun getBondXPForLevel(level: UInt8): UFix64 {
        // Example XP curve: 100, 300, 600, 1000, 1500
        // (10 replies, 30 replies, 60 replies, etc. assuming 10 pts per reply)
        switch level {
            case 2:
                return 100.0
            case 3:
                return 300.0
            case 4:
                return 600.0
            case 5:
                return 1000.0
            default:
                // For levels beyond 5, use a formula
                return 1000.0 + (UFix64(level - 5) * 750.0)
        }
    }
} 