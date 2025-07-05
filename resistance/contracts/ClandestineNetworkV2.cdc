import "NonFungibleToken"
import "MetadataViews"

// ClandestineNetworkV2.cdc
//
// This contract manages the core logic for "The Emissaries' Bond" game.
// It is responsible for:
// - Creating and managing user profiles ("Emisarios") within the Resistance.
// - Forging and evolving the "Corazón Clandestino" (The Bond) Resources.
// - Handling the on-chain representation of the User Skill Tree.
// - Managing co-ownership of Bonds via a central Vault and Claim Ticket NFTs.

access(all) contract ClandestineNetworkV2 {

    // --- Events ---
    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event EmisarioCreated(emisarioID: UInt64, owner: Address)
    access(all) event BondForged(bondID: UInt64, emisario1ID: UInt64, emisario2ID: UInt64)
    access(all) event BondEvolved(bondID: UInt64, newLevel: UInt8, messages: UInt64)
    access(all) event SkillUnlocked(emisarioID: UInt64, skillID: String, branch: String)
    access(all) event EmisarioPublicKeyUpdated(emisarioID: UInt64, newPublicKey: String)

    // --- Contract State ---
    access(all) var totalBonds: UInt64
    access(all) var totalEmisarios: UInt64
    access(all) var totalSupply: UInt64

    // --- Paths ---
    access(all) let EmisarioStoragePath: StoragePath
    access(all) let EmisarioPublicPath: PublicPath
    access(all) let ClaimCollectionStoragePath: StoragePath
    access(all) let ClaimCollectionPublicPath: PublicPath

    // --- Interfaces ---
    
    // Public interface for reading Emisario data
    access(all) resource interface EmisarioPublic {
        access(all) let id: UInt64
        access(all) var level: UInt64
        access(all) var encryptionPubKey: String
        access(all) fun getPublicKey(): String
    }

    // --- Resources ---

    // The Emisario Resource: Represents a player's profile and progression.
    access(all) resource Emisario: EmisarioPublic {
        access(all) let id: UInt64
        access(all) var xp: UFix64
        access(all) var level: UInt64
        access(all) var skillPoints: UInt64
        access(all) var skills: {String: UInt8}
        access(all) var abilityCooldowns: {String: UFix64}

        // New field for the public encryption key.
        // This key is used by other users to encrypt messages sent to this Emisario.
        // It is public information.
        access(all) var encryptionPubKey: String

        init(id: UInt64) {
            self.id = id
            self.xp = 0.0
            self.level = 1
            self.skillPoints = 1
            self.skills = {}
            self.abilityCooldowns = {}
            // The public key is initially empty. The user must set it in a
            // separate transaction after generating their key pair off-chain.
            self.encryptionPubKey = ""
        }

        // Public function to allow the owner to update their encryption key.
        access(all) fun setPublicKey(newKey: String) {
            self.encryptionPubKey = newKey
            emit ClandestineNetworkV2.EmisarioPublicKeyUpdated(emisarioID: self.id, newPublicKey: newKey)
        }

        // Public function to read the encryption public key
        access(all) fun getPublicKey(): String {
            return self.encryptionPubKey
        }
    }

    // The Vinculo (Bond) Resource: The "Corazón Clandestino".
    // Stored centrally in the BondVault, NOT in user collections.
    access(all) resource Vinculo {
        access(all) let id: UInt64
        access(all) let owners: [Address]
        access(all) let emisarioIDs: [UInt64]
        access(all) var messagesExchanged: UInt64
        access(all) var bondLevel: UInt8
        access(all) var bondPoints: UFix64
        access(all) var status: String
        access(all) var artSeed: UInt64
        access(all) var colorPaletteSeed: Int8
        access(all) var patternComplexitySeed: UInt8
        access(all) var codexURI: String

        init(id: UInt64, emisario1: &Emisario, emisario2: &Emisario, owner1: Address, owner2: Address) {
            self.id = id
            self.owners = [owner1, owner2]
            self.emisarioIDs = [emisario1.id, emisario2.id]
            self.messagesExchanged = 0
            self.bondLevel = 1
            self.bondPoints = 0.0
            self.status = "Active"
            self.artSeed = UInt64(getCurrentBlock().timestamp)
            self.colorPaletteSeed = 0
            self.patternComplexitySeed = 1
            self.codexURI = "ipfs://..."
        }
    }

    // The ClaimTicket NFT: The object users actually hold in their collection.
    // It acts as a key to access the shared Vinculo in the BondVault.
    access(all) resource ClaimTicket: NonFungibleToken.NFT {
        access(all) let id: UInt64 // This ID matches the Vinculo's ID
        access(all) let bondID: UInt64
        access(all) let ownerAddress: Address

        init(bondID: UInt64, ownerAddress: Address) {
            self.id = self.uuid
            self.bondID = bondID
            self.ownerAddress = ownerAddress
        }

        access(all) view fun getViews(): [Type] {
            return []
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- ClandestineNetworkV2.createEmptyCollection()
        }
    }

    // The BondVault Resource: Stored centrally by the contract owner to hold all Vinculos.
    access(all) resource BondVault {
        access(all) var bonds: @{UInt64: Vinculo}
        init() {
            self.bonds <- {}
        }
        access(all) fun add(bond: @Vinculo) {
            self.bonds[bond.id] <-! bond
        }
    }

    // Collection Resource: Holds ClaimTicket NFTs, not Vinculos.
    access(all) resource Collection: NonFungibleToken.Collection {
        access(all) var ownedNFTs: @{UInt64: {NonFungibleToken.NFT}}
        init() {
            self.ownedNFTs <- {}
        }
        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }
        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let claimTicket <- token as! @ClaimTicket
            let id: UInt64 = claimTicket.id
            let oldToken <- self.ownedNFTs[id] <- claimTicket
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }
        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            return &self.ownedNFTs[id] as &{NonFungibleToken.NFT}?
        }
        
        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- create Collection()
        }
        
        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            return {Type<@ClaimTicket>(): true}
        }
        
        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@ClaimTicket>()
        }
    }

    // --- Public Functions ---

    // Renamed from totalSupply to avoid confusion with NFT standard.
    access(all) view fun getTotalBonds(): UInt64 {
        return self.totalBonds
    }

    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    access(all) fun createEmisario(): @Emisario {
        ClandestineNetworkV2.totalEmisarios = ClandestineNetworkV2.totalEmisarios + 1
        let newEmisario <- create Emisario(id: ClandestineNetworkV2.totalEmisarios)
        // Don't emit event here since owner is not set yet
        // Event will be emitted when resource is stored in transaction
        return <- newEmisario
    }

    access(all) fun forgeBond(emisario1: &Emisario, emisario2: &Emisario, owner1: Address, owner2: Address): @[ClaimTicket] {
        self.totalBonds = self.totalBonds + 1
        let bondID = self.totalBonds
        let newBond <- create Vinculo(id: bondID, emisario1: emisario1, emisario2: emisario2, owner1: owner1, owner2: owner2)

        let vaultRef = self.account.storage.borrow<auth(Mutate) &BondVault>(from: /storage/ClandestineBondVaultV2)
            ?? panic("BondVault not found!")
        vaultRef.add(bond: <-newBond)

        let claim1 <- create ClaimTicket(bondID: bondID, ownerAddress: owner1)
        let claim2 <- create ClaimTicket(bondID: bondID, ownerAddress: owner2)

        emit BondForged(bondID: bondID, emisario1ID: emisario1.id, emisario2ID: emisario2.id)

        return <- [<-claim1, <-claim2]
    }
    
    // Simplified version for MVP that doesn't require partner's Emisario reference
    access(all) fun forgeBondSimple(emisario1: &Emisario, owner1: Address, owner2: Address): @[ClaimTicket] {
        self.totalBonds = self.totalBonds + 1
        let bondID = self.totalBonds
        
        // Create a temporary placeholder Emisario for the partner
        let tempEmisario <- create Emisario(id: 999999) // Placeholder ID
        
        // Create bond using original constructor
        let newBond <- create Vinculo(
            id: bondID,
            emisario1: emisario1,
            emisario2: &tempEmisario as &Emisario,
            owner1: owner1,
            owner2: owner2
        )

        let vaultRef = self.account.storage.borrow<auth(Mutate) &BondVault>(from: /storage/ClandestineBondVaultV2)
            ?? panic("BondVault not found!")
        vaultRef.add(bond: <-newBond)

        let claim1 <- create ClaimTicket(bondID: bondID, ownerAddress: owner1)
        let claim2 <- create ClaimTicket(bondID: bondID, ownerAddress: owner2)

        emit BondForged(bondID: bondID, emisario1ID: emisario1.id, emisario2ID: tempEmisario.id)

        // Clean up the temporary Emisario
        destroy tempEmisario

        return <- [<-claim1, <-claim2]
    }
    
    access(all) view fun borrowVinculo(id: UInt64): &Vinculo? {
        let vaultRef = self.account.storage.borrow<&BondVault>(from: /storage/ClandestineBondVaultV2)
            ?? panic("BondVault not found!")
        return vaultRef.bonds[id]
    }

    // NEW: Public function to read an Emisario's public key for encryption.
    access(all) view fun getEmisarioPublicKey(address: Address): String? {
        let account = getAccount(address)
        
        // Try to get the public capability for the Emisario
        if let emisarioRef = account.capabilities.get<&{EmisarioPublic}>(self.EmisarioPublicPath).borrow() {
            // Access the property directly instead of calling a method
            return emisarioRef.encryptionPubKey.length > 0 ? emisarioRef.encryptionPubKey : nil
        }
        
        return nil
    }

    init() {
        self.totalBonds = 0
        self.totalEmisarios = 0
        self.EmisarioStoragePath = /storage/ClandestineEmisarioV2
        self.EmisarioPublicPath = /public/ClandestineEmisarioV2
        self.ClaimCollectionStoragePath = /storage/ClandestineClaimCollectionV2
        self.ClaimCollectionPublicPath = /public/ClandestineClaimCollectionV2

        // Initialize the BondVault and store it in the contract account's storage.
        self.account.storage.save(<-create BondVault(), to: /storage/ClandestineBondVaultV2)

        // The NonFungibleToken standard requires a `totalSupply` field, but we are using ClaimTickets.
        // We will manage `totalSupply` of ClaimTickets manually if needed, or ignore if not required
        // by marketplaces. For now, we'll satisfy the interface.
        self.totalSupply = 0

        emit ContractInitialized()
    }
} 