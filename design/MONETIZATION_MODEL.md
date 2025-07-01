# System Design: Monetization Model

## 1. Core Philosophy

Our monetization strategy is designed to be sustainable, ethical, and deeply integrated with the game's core loop and narrative. We avoid "pay-to-win" mechanics. Instead, we charge for **convenience, deeper engagement, and value-added services** that enhance the user experience without breaking the core gameplay. All monetization streams are framed within the game's lore as contributions to "La Resistencia."

## 2. Primary Revenue Streams

### 2.1. Subscription Model ("Cuota de la Red")

-   **Concept:** A small, recurring monthly fee (e.g., $2.99 - $4.99 USD) is required to maintain access to the full feature set of the clandestine network.
-   **Justification:** This represents the user's contribution to keeping the Resistance's servers online and their network hidden from "El Conductor."
-   **Features Unlocked:**
    -   Access to the full User and AI Skill Trees.
    -   Ability to initiate new Vínculos.
    -   Participation in the on-chain gifting and sponsorship systems.
-   **Free-to-Play (F2P) Tier:** Non-subscribers can receive and reply to messages from subscribers but cannot initiate new connections or access most of the progression systems. This allows for viral growth while encouraging conversion.

### 2.2. Gift Commission ("Tarifa de Contrabando")

-   **Concept:** A platform fee (e.g., 5-10%) is applied to all on-chain gifts sent through the platform, especially those involving real-world value (escrowed FLOW for a coffee, etc.).
-   **Justification:** This fee covers the "smuggling costs" of moving value discreetly without being flagged by El Conductor's monitored economy. It pays for the "secure routes" and "trusted couriers" (our backend infrastructure and payment processing).
-   **Implementation:** The fee is automatically deducted by the `Gifts.cdc` smart contract during the transaction, ensuring transparency.

## 3. Secondary & Community-Driven Revenue Streams

### 3.1. Vínculo Sponsorship ("Apoyo a la Célula")

-   **Concept:** This is a novel form of social support. A user can choose to "sponsor" a Vínculo (a relationship) that they are following and find inspiring.
-   **Mechanics:**
    1.  A user (the "Patron") visits a Vínculo's public page (where the published "Codex" is displayed).
    2.  The Patron can make a direct donation in FLOW to the Vínculo.
    3.  **Effect:** This donation is split:
        -   **80%** goes directly to the two owners of the Vínculo.
        -   **10%** is awarded to the Vínculo as `Bond Points`, accelerating their relationship progression. This is the "help" component.
        -   **10%** is a platform fee (the "cost of routing the support signal through the network").
-   **Justification:** Patrons are not just donating; they are actively helping a connection they admire to flourish. This creates a positive, supportive community ecosystem.

### 3.2. "Read-to-Earn" Commission ("Impuesto del Archivo")

-   **Concept:** As defined in `VINCULO_NFT_SYSTEM.md`, the platform takes a small commission (e.g., 5%) on the revenue generated from other users paying to read the published stories ("Codex") of a Vínculo.
-   **Justification:** This is the "archivist's fee" for maintaining the secure, decentralized library of Resistance manifestos and making them available to all members.

## 4. On-Chain Assets & Future Potential

-   **Sello Personalizado NFTs:** While the primary market is the user creating their own, a secondary market could emerge on platforms like Flow's marketplaces where users trade or sell unique seal designs. The platform would take a standard royalty on secondary sales.
-   **Immortalized Vínculos:** Completed and "Immortalized" Vínculos, representing a finished story, could be made transferable and sellable as unique pieces of narrative art. This provides a long-term economic incentive for seeing a relationship through to its "endgame."

This multi-faceted model ensures the platform has diverse revenue streams, from stable subscriptions to community-driven transactions, all while reinforcing the core themes of cooperation and rebellion. 