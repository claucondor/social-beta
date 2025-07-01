import "NonFungibleToken"
import "MetadataViews"

// ClandestineNetwork.cdc
//
// This contract manages the core logic for "The Emissaries' Bond" game.
// It is responsible for:
// - Creating and managing user profiles ("Emisarios") within the Resistance.
// - Forging and evolving the "Corazón Clandestino" (The Bond) Resources.
// - Handling the on-chain representation of the User Skill Tree.
// - Managing co-ownership of Bonds via a central Vault and Claim Ticket NFTs.

access(all) contract ClandestineNetwork: NonFungibleToken {

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

    // --- Paths ---
    access(all) let EmisarioStoragePath: StoragePath
    access(all) let ClaimCollectionStoragePath: StoragePath
    access(all) let ClaimCollectionPublicPath: PublicPath

    // --- Resources ---

    // The Emisario Resource: Represents a player's profile and progression.
    access(all) resource Emisario {
        pub let id: UInt64
        pub var xp: UFix64
        pub var level: UInt64
        pub var skillPoints: UInt64
        pub var skills: {String: UInt8}
        pub var abilityCooldowns: {String: UFix64}

        // New field for the public encryption key.
        // This key is used by other users to encrypt messages sent to this Emisario.
        // It is public information.
        pub(set) var encryptionPubKey: String

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
            emit ClandestineNetwork.EmisarioPublicKeyUpdated(emisarioID: self.id, newPublicKey: newKey)
        }
    }

    // The Vínculo (Bond) Resource: The "Corazón Clandestino".
    // Stored centrally in the BondVault, NOT in user collections.
    access(all) resource Vínculo {
        pub let id: UInt64
        pub let owners: [Address]
        pub let emisarioIDs: [UInt64]
        pub var messagesExchanged: UInt64
        pub var bondLevel: UInt8
        pub var bondPoints: UFix64
        pub var status: String
        pub var artSeed: UInt64
        pub var colorPaletteSeed: Int8
        pub var patternComplexitySeed: UInt8
        pub var codexURI: String

        init(id: UInt64, emisario1: &Emisario, emisario2: &Emisario, owner1: Address, owner2: Address) {
            self.id = id
            self.owners = [owner1, owner2]
            self.emisarioIDs = [emisario1.id, emisario2.id]
            self.messagesExchanged = 0
            self.bondLevel = 1
            self.bondPoints = 0.0
            self.status = "Active"
            self.artSeed = getCurrentBlock().timestamp.toBigEndianBytes().toUInt64()
            self.colorPaletteSeed = 0
            self.patternComplexitySeed = 1
            self.codexURI = "ipfs://..."
        }
    }

    // The ClaimTicket NFT: The object users actually hold in their collection.
    // It acts as a key to access the shared Vínculo in the BondVault.
    access(all) resource ClaimTicket: NonFungibleToken.NFT, ViewResolver.Resolver {
        pub let id: UInt64 // This ID matches the Vínculo's ID
        pub let bondID: UInt64
        pub let ownerAddress: Address

        init(bondID: UInt64, ownerAddress: Address) {
            self.id = self.uuid
            self.bondID = bondID
            self.ownerAddress = ownerAddress
        }

        access(all) view fun getViews(): [Type] {
            return [Type<MetadataViews.Display>()]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            let bond = ClandestineNetwork.borrowVínculo(id: self.bondID) ?? panic("Bond not found")
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: "Claim Ticket for Corazón Clandestino #".concat(self.bondID.toString()),
                        description: "This ticket proves co-ownership of a shared Vínculo. Current Level: ".concat(bond.bondLevel.toString()),
                        thumbnail: MetadataViews.HTTPFile(url: "https://.../vinculo/".concat(self.bondID.toString()).concat(".svg"))
                    )
            }
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- create Collection()
        }
    }

    // The BondVault Resource: Stored centrally by the contract owner to hold all Vínculos.
    access(self) resource BondVault {
        pub var bonds: @{UInt64: Vínculo}
        init() {
            self.bonds <- {}
        }
        pub fun add(bond: @Vínculo) {
            self.bonds[bond.id] <-! bond
        }
    }

    // Collection Resource: Holds ClaimTicket NFTs, not Vínculos.
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
    }

    // --- Public Functions ---

    // Renamed from totalSupply to avoid confusion with NFT standard.
    access(all) view fun getTotalBonds(): UInt64 {
        return self.totalBonds
    }

    access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
        return <- create Collection()
    }

    access(all) fun createEmisario(): @Emisario {
        ClandestineNetwork.totalEmisarios = ClandestineNetwork.totalEmisarios + 1
        let newEmisario <- create Emisario(id: ClandestineNetwork.totalEmisarios)
        emit EmisarioCreated(emisarioID: newEmisario.id, owner: newEmisario.owner!.address)
        return <- newEmisario
    }

    access(all) fun forgeBond(emisario1: &Emisario, emisario2: &Emisario, owner1: Address, owner2: Address): @[ClaimTicket] {
        self.totalBonds = self.totalBonds + 1
        let bondID = self.totalBonds
        let newBond <- create Vínculo(id: bondID, emisario1: emisario1, emisario2: emisario2, owner1: owner1, owner2: owner2)

        let vaultRef = self.account.storage.borrow<auth(Mutate) &BondVault>(from: /storage/ClandestineBondVault)
            ?? panic("BondVault not found!")
        vaultRef.add(bond: <-newBond)

        let claim1 <- create ClaimTicket(bondID: bondID, ownerAddress: owner1)
        let claim2 <- create ClaimTicket(bondID: bondID, ownerAddress: owner2)

        emit BondForged(bondID: bondID, emisario1ID: emisario1.id, emisario2ID: emisario2.id)

        return <- [<-claim1, <-claim2]
    }
    
    access(all) view fun borrowVínculo(id: UInt64): &Vínculo? {
        let vaultRef = self.account.storage.borrow<&BondVault>(from: /storage/ClandestineBondVault)
            ?? panic("BondVault not found!")
        return &vaultRef.bonds[id] as &Vínculo?
    }

    // NEW: Public function to read an Emisario's public key for encryption.
    access(all) view fun getEmisarioPublicKey(address: Address): String? {
        let emisarioRef = getAccount(address).storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
        return emisarioRef?.encryptionPubKey
    }

    init() {
        self.totalBonds = 0
        self.totalEmisarios = 0
        self.EmisarioStoragePath = /storage/ClandestineEmisario
        self.ClaimCollectionStoragePath = /storage/ClandestineClaimCollection
        self.ClaimCollectionPublicPath = /public/ClandestineClaimCollection

        // Initialize the BondVault and store it in the contract account's storage.
        self.account.storage.save(<-create BondVault(), to: /storage/ClandestineBondVault)

        // The NonFungibleToken standard requires a `totalSupply` field, but we are using ClaimTickets.
        // We will manage `totalSupply` of ClaimTickets manually if needed, or ignore if not required
        // by marketplaces. For now, we'll satisfy the interface.
        self.totalSupply = 0

        emit ContractInitialized()
    }
} 