# System Design: The Vínculo NFT (Clandestine Edition)

## 1. Core Concept

The Vínculo NFT, now known as the **"Corazón Clandestino" (Clandestine Heart)**, is the central, evolving artifact representing a relationship between two members of the Resistance. It is a symbol of defiance against El Conductor's sterile world—a living, co-owned digital soul of a connection that "shouldn't" exist. Its purpose is to give tangible, artistic, and narrative weight to the act of rebellion that is forging a real human bond.

## 2. On-Chain Resource Structure (Cadence)

The structure remains the same, but the narrative context of each field is now clearer. The `Vínculo` resource is a piece of rogue technology.

```cadence
// Contract renamed to reflect the lore
pub contract ClandestineNetwork {

    // Events are now framed as "signals" in the network
    pub event BondForged(id: UInt64, owner1: Address, owner2: Address)
    pub event BondEvolved(id: UInt64, newLevel: UInt8, artSeed: UInt64, message: String) // Added a message for context
    pub event BondImmortalized(id: UInt64, finalCodexURI: String)

    pub resource Vínculo {
        pub let id: UInt64
        pub let owners: [Address]

        // --- Core Stats ---
        pub var messagesExchanged: UInt64
        pub var bondLevel: UInt8
        // Status: "Active", "Waning" (being monitored), "Immortalized" (a legend)
        pub var status: String 

        // --- Generative Art: "Glitch Art" Seeds ---
        pub var artSeed: UInt64 // The core "glitch" pattern
        pub var colorPaletteSeed: Int8 // Represents the "emotional heat" signature
        pub var patternComplexitySeed: UInt8 // Represents the complexity of the "rogue code"

        // --- AI Codex: "The Samizdat Manifest" ---
        pub var codexURI: String 

        init(owner1: Address, owner2: Address) {
            self.id = self.uuid
            self.owners = [owner1, owner2]
            self.messagesExchanged = 0
            self.bondLevel = 1
            self.status = "Active"
            self.artSeed = // Use on-chain randomness from Flow VRF
            self.colorPaletteSeed = 0
            self.patternComplexitySeed = 1
            self.codexURI = "ipfs://..." // Link to "Anexo 1: Primera Conexión"
        }
    }
    // ...
}
```

## 3. Generative Art Component ("The Glitch Visage")

The art is now "Glitch Art." It starts as a clean, sterile, geometric shape (approved by El Conductor's aesthetics). As the bond grows, it "corrupts" with beautiful, chaotic, organic patterns and warm colors, representing humanity breaking through the artificial perfection. The `artSeed` changing at a major Hito de Vínculo represents a "cascade failure" in El Conductor's system, leading to a more complex and beautiful visual "error".

## 4. AI Narrative Component ("The Samizdat Codex")

The narrative is no longer just a story; it's a **"Samizdat"**—a forbidden, self-published manuscript.

-   **Process:** When a `BondEvolved` event is triggered, the AI Helper compiles its "Mission Report."
-   **IA Prompt (New):** *"Genera el Anexo [X] para el manifiesto de la célula [ID del Vínculo]. El análisis de la comunicación no filtrada revela los siguientes temas: [tema A, tema B]. El pico emocional detectado fue [emoción]. Documenta esta anomalía como prueba de la viabilidad de la conexión humana no supervisada."*
-   **Monetization ("Publicar el Manifiesto"):** Publishing the story is an act of defiance, sharing proof with the rest of the Resistance that connection is possible.

## 5. The Immortalization Event: "Going Dark"

-   **Concept:** This is the ultimate act of rebellion. The couple decides to take their connection "off-grid," beyond even the Resistance's clandestine network.
-   **Trigger:** The same mutual transaction, but now it's framed as activating a "kill switch" that severs all monitoring, even from the Resistance.
-   **On-Chain Effects:** The `status` is set to `Immortalized`. All seeds are locked. The IA writes the final entry: "Anexo Final: La Célula ha Desaparecido. Misión Cumplida." The NFT becomes a legend within the network, a story of a bond so strong it achieved true freedom.

--- 