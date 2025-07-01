// register_skill.cdc
//
// ADMIN-ONLY TRANSACTION
// This transaction registers a new skill in the SkillRegistry contract,
// making it available in the game.

import "SkillRegistry"

transaction(
    id: String,
    branch: String,
    maxLevel: UInt8,
    levelRequirement: UInt64,
    prereqID: String?,
    description: String
) {

    let adminRef: &SkillRegistry.Admin

    prepare(adminAcct: auth(Storage) &Account) {
        // This transaction must be signed by the account that deployed the
        // SkillRegistry contract.
        self.adminRef = adminAcct.storage.borrow<&SkillRegistry.Admin>(from: /storage/SkillRegistryAdmin)
            ?? panic("Could not borrow a reference to the SkillRegistry Admin resource.")
    }

    execute {
        let newData = SkillRegistry.SkillData(
            id: id,
            branch: branch,
            maxLevel: maxLevel,
            levelRequirement: levelRequirement,
            prereqID: prereqID,
            description: description
        )
        self.adminRef.registerSkill(data: newData)
        log("Skill '".concat(id).concat("' has been successfully registered."))
    }
} 