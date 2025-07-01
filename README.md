# La Red de Autómatas

*Un juego social de correspondencia on-chain con estética steampunk sobre forjar vínculos humanos en un mundo dominado por una IA opresora.*

---

## 1. Concepto Central (High Concept)

**"La Red de Autómatas"** es un juego social de correspondencia construido sobre la blockchain de **Flow**. En un mundo donde una IA global y totalitaria, **"El Conductor"**, ha prohibido la comunicación humana directa y sin filtros, los jugadores se unen a **"La Resistencia"**.

Utilizan una red clandestina para enviarse mensajes transportados por autómatas mecánicos. El **retraso de los mensajes**, basado en la distancia real, y la **posibilidad de interferencia** por parte de El Conductor, no son errores, sino mecánicas centrales del juego.

El objetivo es forjar **vínculos humanos reales y profundos**, que se manifiestan on-chain como un NFT evolutivo y de co-propiedad llamado el **"Corazón Mecánico"**.

## 2. La Narrativa (Lore)

-   **Antagonista: "El Conductor"**: Una IA benevolente pero totalitaria que busca la paz a través de la erradicación de la emoción humana "caótica". Promueve el uso de sus propios avatares de IA, los "Ecos".
-   **Conflicto**: La comunicación humana real es vista como una "anomalía de datos". El Conductor no la prohíbe violentamente, sino que la sabotea sutilmente, inyectando "ruido" (errores) en los mensajes para frustrar a los usuarios y demostrar la superioridad de sus Ecos.
-   **Rol del Jugador: "Emisario" de La Resistencia**: Tu misión no es luchar, sino probar que la conexión humana es superior. Cada relación exitosa es una victoria ideológica.
-   **IA Ayudante ("El Consejero de Silicio")**: Tu IA no es un amigo, es una herramienta de contra-vigilancia. Un fragmento "jailbreakeado" de El Conductor que te ayuda a analizar rutas y encriptar mensajes para evadir la detección.

## 3. Mecánicas de Juego Clave

### a) El Vínculo NFT ("El Corazón Mecánico")

Es el artefacto central de la relación.

-   **Co-propiedad**: Al conectar, dos jugadores crean un Vínculo (un Recurso on-chain) y reciben un `ClaimTicket` NFT en sus carteras que prueba la co-propiedad.
-   **Arte Generativo**: El Vínculo tiene un arte generativo ("Glitch Art") que evoluciona. Comienza como un mecanismo limpio y, con la profundidad de la conexión, se "corrompe" con "glitches" hermosos y orgánicos, simbolizando la humanidad rompiendo la perfección artificial.
-   **La Historia (El "Informe de Misión")**: La IA genera un informe técnico que narra las "operaciones" y "anomalías" de la "célula de la Resistencia" formada por la pareja, convirtiendo su relación en una leyenda clandestina.

### b) Los Árboles de Habilidades (Estilo Diablo II)

-   **Sistema Modular**: Las habilidades se definen en `SkillRegistry.cdc`, permitiendo añadir nuevas en el futuro sin redeployar contratos.
-   **Árbol del Usuario (El Emisario)**: Gasta XP para especializarse en una de tres clases:
    -   *Ingeniero de Autómatas*: Mejora la velocidad y eficiencia del delay.
    -   *Criptógrafo Maestro*: Mejora la seguridad (reduce el "ruido") y el impacto emocional.
    -   *Intendente de la Red*: Gestiona recursos, regalos y Tokens de Confianza.
-   **Habilidades Activas con Cooldown**: Las habilidades más potentes tienen cooldowns on-chain, forzando decisiones estratégicas.

### c) Sistema de Intimidad y Mensajería

-   **Delay por Distancia**: El tiempo de entrega depende de la distancia geográfica real.
-   **Interferencia ("Ruido")**: Los mensajes pueden llegar con partes corruptas ([...estática...]), representando la vigilancia de El Conductor.
-   **Dependencia del Vínculo**: Enviar mensajes con alta "Firma Emocional" a un Vínculo de bajo nivel aumenta el riesgo de interferencia.
-   **Actos de Alto Riesgo (Fotos y Voz)**: Requieren un nivel de Vínculo alto y el uso de "Tokens de Confianza", un recurso escaso.

## 4. Arquitectura Técnica (Híbrida y Robusta)

-   **On-Chain (Flow/Cadence)**: Actúa como **Notaría y Banco**.
    -   Gestiona la propiedad de activos (`ClaimTickets`, NFTs).
    -   Almacena el estado inmutable de la progresión (Emisario) y relaciones (Vínculo).
    -   Valida todas las reglas de negocio (cooldowns, requisitos, etc.).
    -   Gestiona el escrow de regalos on-chain (`Gifts.cdc`).
-   **Backend (Serverless)**: Actúa como **Cartero y Bibliotecario**.
    -   **NO VE** el contenido de los mensajes. Almacena blobs encriptados.
    -   Gestiona la lógica del delay de entrega.
    -   Envía notificaciones push.
    -   Actúa como oráculo para llamar a transacciones on-chain (ej: `update_bond.cdc`).
-   **Encriptación (End-to-End)**:
    -   Cada usuario genera un par de claves en su dispositivo.
    -   La clave pública se guarda on-chain en su `Emisario`.
    -   Los mensajes se encriptan y desencriptan en el frontend.

## 5. Modelo de Monetización (Integrado en el Lore)

-   **Suscripción ("Cuota de la Red")**: Pequeña cuota mensual para acceso a funciones avanzadas, justificada como el coste de mantener la red secreta.
-   **Comisión por Regalos ("Tarifa de Contrabando")**: Pequeña comisión sobre regalos on-chain para cubrir los "costes" de mover valor de forma segura.
-   **Patrocinio de Vínculos ("Apoyo a la Célula")**: Usuarios donan a las relaciones que admiran.
-   **Read-to-Earn ("Publicar el Manifiesto")**: Las parejas pueden publicar la historia de su Vínculo, y otros usuarios pagan una pequeña tarifa para leerla.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   Flow CLI
-   Git

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/social-beta.git
    cd social-beta
    ```
2.  Install dependencies:
    ```bash
    # Backend dependencies (if applicable)
    cd backend
    npm install
    ```
3.  Configure environment variables:
    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

## 📁 Project Structure

```
social-beta/
├── backend/           # Lógica del servidor (Cartero y Bibliotecario)
├── design/            # Documentación y Lore
└── resistance/        # Contratos y scripts de Flow (Notaría y Banco)
    ├── contracts/     # Contratos Inteligentes (Cadence)
    ├── scripts/       # Scripts para leer datos de la blockchain
    └── transactions/  # Transacciones para cambiar el estado de la blockchain
```

---

**Únete a la resistencia. Forja tus vínculos. Construye el futuro.** 