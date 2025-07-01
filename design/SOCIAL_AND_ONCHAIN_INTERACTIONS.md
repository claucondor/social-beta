# System Design: Social & On-Chain Interactions

## 1. Core Philosophy

The social interactions in this game are designed to be meaningful and carry weight. Every significant action, from requesting a photo to sending a real-world gift, is a tactical decision governed by game mechanics and registered on the Flow blockchain to ensure permanence and value. This system transforms standard social features into a strategic layer of gameplay.

## 2. Intimacy System: Photos & Voice Notes

This system governs the exchange of more personal media, making it a privilege earned through trust, not a default feature.

-   **The "Token de Confianza":**
    -   This is an off-chain, numerical resource that regenerates slowly (e.g., 1 token every 48 hours).
    -   **Usage:** A user must spend one Token to make a `Request` for a photo or a voice note from another user.
    -   **Risk/Reward:** If the request is **rejected**, the token is lost. If it is **accepted**, the token is consumed, but the interaction generates a large number of `Bond Points`, making it a worthwhile investment.
-   **The `Request` Flow:**
    1.  **Initiation:** User A spends a Token to send a `Photo Request` to User B. This is an off-chain action.
    2.  **Notification:** User B receives a clear, actionable notification: "User A is requesting a photo. Accepting will strengthen your Vínculo. You have 24 hours to respond."
    3.  **Acceptance (On-Chain Trigger):** If User B accepts, the frontend initiates a Flow transaction. This transaction does two things:
        -   It emits a `RequestAccepted` event.
        -   It calls the main contract to add a significant number of `Bond Points` to their shared `Vínculo` resource.
    4.  **Content Delivery:** Upon successful transaction, the app's backend authorizes User B to upload a photo, which is then sent to User A through a private, encrypted channel.
-   **Unlocking:** The ability to even make these requests is locked behind the `Friendship Tree`. You cannot request a photo until your Vínculo reaches Level 2, and you cannot request a voice note until Level 3.

## 3. On-Chain Gifting System

This system allows users to send real-world value to each other, facilitated and verified by the blockchain.

-   **Gift Contract (`Gifts.cdc`):**
    -   A dedicated smart contract will manage the escrow and verification of gifts.
    -   **Process:**
        1.  **Offer:** User A chooses a gift (e.g., "A Coffee") and calls the `offerGift` function, depositing the corresponding amount of FLOW or FUSD into the contract's escrow. An event `GiftOffered` is emitted.
        2.  **Acceptance:** User B is notified and can accept the gift, providing their necessary details (off-chain, for privacy).
        3.  **Verification:** To release the funds from escrow to User B, User B must provide "Proof of Delivery." This proof can be:
            -   A photo of the item (e.g., the coffee).
            -   A receipt.
            -   A location-based check-in.
            The hash of this proof is submitted on-chain.
        4.  **Confirmation:** User A reviews the proof and calls the `confirmDelivery` function, which releases the funds to User B. A `GiftCompleted` event is emitted, and a massive amount of `Bond Points` are awarded to their Vínculo.
-   **Gift Types:**
    -   **Digital:** NFTs from other Flow projects, in-game cosmetics (new paper textures, ink colors).
    -   **Real-World (Escrowed):** Coffee, a book, a meal. The contract holds the value until delivery is confirmed.
    -   **API-driven:** Integration with services like Amazon (send a gift card) or Spotify (send a premium subscription).

## 4. Monetization Model: "Read-to-Earn"

This is the primary economic engine of the game, allowing users to monetize the quality of their connections.

-   **Publishing a Vínculo:**
    -   When a Vínculo's `Codex` (the AI-generated story) reaches a certain length or quality, the two owners can mutually decide to "publish" it.
    -   This action calls a transaction that flags their Vínculo NFT as `isPublished: true`.
-   **The Reading Room:**
    -   A section of the app, "The Library of Bonds," showcases published Vínculos. They can be sorted by popularity, emotional tone, length, etc.
-   **Access Fee:**
    -   To read a published story, a third-party user pays a small fee (e.g., 0.5 FLOW) to a dedicated `ReadingRoom` smart contract.
    -   The contract takes a small platform fee (e.g., 5%).
    -   The remaining 95% is automatically split and sent to the two owners of the Vínculo NFT.
-   **Economic Loop:** This creates a powerful incentive for users to form deep, interesting relationships, as the resulting stories can become a source of passive income. It rewards authentic connection over grinding.

## 5. Core On-Chain Loop

`User Action (off-chain)` -> `Triggers On-Chain Transaction (Flow)` -> `Updates Vínculo NFT Resource` -> `Unlocks New Abilities/Evolves Art & Story` -> `Enables Deeper User Action` 