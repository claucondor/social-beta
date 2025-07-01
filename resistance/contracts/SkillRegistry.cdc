// SkillRegistry.cdc
//
// This contract acts as an on-chain database for all skills available in the
// Clandestine Network. It allows the admin to register new skills and define
// their properties, including prerequisites and hierarchy, without ever
// needing to redeploy the main ClandestineNetwork contract. This makes the
// game's progression system infinitely expandable.

access(all) contract SkillRegistry {

    // --- Events ---
    access(all) event SkillRegistered(skillID: String, branch: String, maxLevel: UInt8)
    access(all) event SkillUpdated(skillID: String)

    // --- Structs ---

    // Defines all the static properties of a single skill.
    access(all) struct SkillData {
        // The unique identifier for the skill, e.g., "rafagaEpistolar"
        pub let id: String
        // The branch this skill belongs to, e.g., "estratega"
        pub let branch: String
        // The maximum level a player can invest in this skill.
        pub let maxLevel: UInt8
        // The minimum Emisario level required to unlock this skill.
        pub let levelRequirement: UInt64
        // The ID of the skill that must be unlocked before this one.
        // Optional, as Tier 1 skills have no prerequisite.
        pub let prereqID: String?
        // A short description for UI purposes.
        pub let description: String

        init(id: String, branch: String, maxLevel: UInt8, levelRequirement: UInt64, prereqID: String?, description: String) {
            self.id = id
            self.branch = branch
            self.maxLevel = maxLevel
            self.levelRequirement = levelRequirement
            self.prereqID = prereqID
            self.description = description
        }
    }

    // --- Contract State ---
    
    // The dictionary holding all registered skills.
    // The key is the skill's unique ID.
    access(all) var skills: {String: SkillData}

    // --- Admin Resource ---
    // A resource held by the contract deployer to manage the registry.
    access(all) resource Admin {
        access(all) fun registerSkill(data: SkillData) {
            pre {
                // Prevent overwriting existing skills accidentally. Use updateSkill for that.
                !SkillRegistry.skills.containsKey(data.id): "Skill with this ID is already registered."
            }
            SkillRegistry.skills[data.id] = data
            emit SkillRegistered(skillID: data.id, branch: data.branch, maxLevel: data.maxLevel)
        }

        access(all) fun updateSkill(data: SkillData) {
            pre {
                SkillRegistry.skills.containsKey(data.id): "Skill with this ID does not exist."
            }
            SkillRegistry.skills[data.id] = data
            emit SkillUpdated(skillID: data.id)
        }
    }

    // --- Public Functions ---
    access(all) view fun getSkillData(skillID: String): SkillData? {
        return self.skills[skillID]
    }

    access(all) view fun getAllSkillIDs(): [String] {
        return self.skills.keys
    }

    init() {
        self.skills = {}
        // Save the Admin resource to the contract account's storage.
        self.account.storage.save(<-create Admin(), to: /storage/SkillRegistryAdmin)
    }
} 