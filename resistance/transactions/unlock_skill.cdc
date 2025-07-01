// unlock_skill.cdc
//
// This transaction allows an Emisario to spend a skill point to unlock or
// level up a specific skill. It now reads skill data dynamically from the
// SkillRegistry contract, making the system expandable.

import "ClandestineNetwork"
import "SkillRegistry"

transaction(skillID: String) {

    let emisarioRef: &ClandestineNetwork.Emisario
    let skillData: SkillRegistry.SkillData

    prepare(signer: auth(Storage) &Account) {
        // --- Get User and Skill Data ---
        self.emisarioRef = signer.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
            ?? panic("Emisario resource not found. Please run setup_account.cdc")

        self.skillData = SkillRegistry.getSkillData(skillID: skillID)
            ?? panic("Skill with the specified ID is not registered.")
    }

    execute {
        // 1. Check if the user has skill points to spend.
        if self.emisarioRef.skillPoints < 1 {
            panic("Not enough skill points. Current: 0")
        }

        // 2. Check if the user meets the level requirement for this skill.
        if self.emisarioRef.level < self.skillData.levelRequirement {
            panic("Level requirement not met. Required: ".concat(self.skillData.levelRequirement.toString()).concat(", Current: ").concat(self.emisarioRef.level.toString()))
        }
        
        // 3. Check for prerequisites.
        let currentSkillLevel = self.emisarioRef.skills[self.skillData.id] ?? 0

        if let prereqID = self.skillData.prereqID {
            if (self.emisarioRef.skills[prereqID] ?? 0) == 0 {
                panic("Prerequisite skill '".concat(prereqID).concat("' not unlocked."))
            }
        }

        // 4. Check if the skill is already at max level.
        if currentSkillLevel >= self.skillData.maxLevel {
            panic("Skill is already at max level.")
        }

        // --- All checks passed. Unlock/upgrade the skill. ---
        
        // Spend the skill point
        self.emisarioRef.skillPoints = self.emisarioRef.skillPoints - 1

        // Increase the skill level
        self.emisarioRef.skills[self.skillData.id] = currentSkillLevel + 1

        log("Skill '".concat(self.skillData.id).concat("' in branch '").concat(self.skillData.branch).concat("' unlocked/upgraded to level ").concat((currentSkillLevel + 1).toString()))
        log("Skill points remaining: ".concat(self.emisarioRef.skillPoints.toString()))

        emit ClandestineNetwork.SkillUnlocked(emisarioID: self.emisarioRef.id, skillID: self.skillData.id, branch: self.skillData.branch)
    }
} 