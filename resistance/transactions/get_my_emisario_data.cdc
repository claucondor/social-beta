// get_my_emisario_data.cdc
//
// This transaction allows users to read their own Emisario data
// and log it to the console. Since scripts cannot access private storage,
// this transaction approach is needed for users to view their own data.

import "ClandestineNetwork"

transaction {

    let emisarioRef: &ClandestineNetwork.Emisario

    prepare(signer: auth(Storage) &Account) {
        self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Emisario resource not found. Please run setup_account.cdc first")
    }

    execute {
        // Log all the Emisario data
        log("=== EMISARIO DATA ===")
        log("ID: ".concat(self.emisarioRef.id.toString()))
        log("Level: ".concat(self.emisarioRef.level.toString()))
        log("XP: ".concat(self.emisarioRef.xp.toString()))
        log("Skill Points: ".concat(self.emisarioRef.skillPoints.toString()))
        log("Encryption Public Key: ".concat(self.emisarioRef.encryptionPubKey))
        
        // Log skills
        log("=== SKILLS ===")
        for skillID in self.emisarioRef.skills.keys {
            let skillLevel = self.emisarioRef.skills[skillID]!
            log("Skill ".concat(skillID).concat(": Level ").concat(skillLevel.toString()))
        }
        
        // Log ability cooldowns
        log("=== ABILITY COOLDOWNS ===")
        for abilityID in self.emisarioRef.abilityCooldowns.keys {
            let cooldown = self.emisarioRef.abilityCooldowns[abilityID]!
            log("Ability ".concat(abilityID).concat(": Cooldown ").concat(cooldown.toString()))
        }
        
        log("=== END EMISARIO DATA ===")
    }
} 