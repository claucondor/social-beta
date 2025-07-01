# Project Codex: The Emissaries' Bond

## 1. High Concept

**The Emissaries' Bond** is a social correspondence game built on Flow, where anonymous global connections are paramount. The delay in communication, based on real-world distance, is a core feature, not a bug. Every relationship between two users evolves into a unique, living **NFT called "El Vínculo" (The Bond)**. This NFT features AI-generated generative art and a collaborative, epic narrative, creating a new form of monetizable, emotional asset—a "Wattpad real potenciado por IA". The journey culminates when two users meet in real life, finalizing their story and immortalizing their Vínculo NFT on the blockchain forever.

## 2. Core Philosophy

- **La Paciencia es una Virtud:** El delay no es un obstáculo, es una mecánica que fomenta mensajes más pensados y significativos.
- **La Intimidad es un Logro:** Las funciones como el envío de fotos y voz no son estándar; son recompensas que se desbloquean a través de la confianza y el progreso mutuo.
- **La Conexión es un Artefacto:** Las relaciones no son efímeras. Se cristalizan en un activo digital (el Vínculo NFT) que tiene valor estético, narrativo y económico.
- **On-Chain para lo que Importa:** Utilizamos Flow para registrar lo que es permanente y valioso: la identidad, los hitos de la relación y los activos únicos, manteniendo la comunicación fluida y privada.

## 3. El Vínculo NFT: El Corazón de la Experiencia

En lugar de que los mensajes sean NFTs, la **relación misma** se mintea como un NFT compartido cuando dos usuarios intercambian su primer mensaje. Este NFT, un Recurso en Cadence, es copropiedad de ambos y evoluciona con cada interacción.

### Atributos del Vínculo NFT:

- **Arte Generativo (La Portada):** La imagen del NFT es un SVG dinámico generado on-chain. Sus propiedades visuales cambian según las estadísticas de la relación:
    - **Paleta de Colores:** Se basa en el tono emocional predominante de la conversación (analizado por la IA).
    - **Complejidad de Patrones:** Aumenta con el número de mensajes intercambiados.
    - **Brillo y Pulsaciones:** Se intensifican cuando se usan habilidades activas o se alcanzan hitos.
- **El Códice (La Historia de IA):** El Vínculo contiene "El Códice", una historia épica co-escrita por la IA.
    - La IA analiza los temas, anécdotas y emociones de la conversación para escribir capítulos que narran la "historia de los dos Emisarios".
    - Los capítulos se desbloquean al alcanzar nuevos niveles en el Árbol de Amistad.
    - **Monetización:** Los Vínculos con historias excepcionales pueden ser "publicados". Otros usuarios pueden pagar una pequeña tarifa en FLOW para leerlos, generando ingresos para la pareja.
- **Metadatos On-Chain:**
    - `Distancia_Inicial_km`: La distancia que los separaba al inicio.
    - `Mensajes_Intercambiados`: Un contador que sube con cada respuesta.
    - `Nivel_De_Vínculo`: El nivel actual en el Árbol de Amistad.
    - `Estado`: Activo, Marchito, o **Inmortalizado**.
- **El Final:** Cuando la pareja se conoce en la vida real y lo verifica on-chain (ej: una transacción iniciada por ambos en la misma ubicación GPS), el estado del NFT cambia a **Inmortalizado**. El arte generativo final se bloquea y la IA escribe el último capítulo: "El Encuentro". El NFT se convierte en un artefacto histórico y coleccionable.

## 4. Árboles de Habilidades (Edición Compleja)

Estos son los árboles que definen tu estilo de juego y el de tu IA.

### 4.1. Árbol del Usuario: "El Emisario"
*(Ganas 1 Punto de Habilidad por nivel de XP)*

**Clase: Estratega Postal (Maestría en Tiempo)**
- **T1: `Correo Prioritario` (0/5):** Reduce delay pasivamente 1% por punto.
- **T2: `Envíos Agrupados` (0/3):** Permite agrupar +1 mensaje corto por punto.
- **T3 (Elección Estratégica):**
    - **`Maestría en Atajos` (0/5):** Pasivo: +1% chance/punto de que tu mensaje encuentre una 'ruta rápida' (15% menos delay).
    - **`Mente Predictiva` (0/5):** Pasivo: Reduce el cooldown de tus habilidades de Estratega en 2% por punto.
- **T4 (Ultimate): `Ráfaga Epistolar` (0/1):** **Activa:** Envía un mensaje con 50% menos de delay. **[Cooldown: 72h]**

**Clase: Calígrafo Arcano (Maestría en Impacto)**
- **T1: `Tinta Adicional` (0/5):** Aumenta límite de caracteres 10% por punto.
- **T2: `Sello Personalizado NFT` (0/1):** Tu identidad on-chain.
- **T3 (Elección Estratégica):**
    - **`Prosa Persuasiva` (0/5):** Pasivo: +1% chance/punto de que tus solicitudes (foto/voz) sean aceptadas.
    - **`Paleta Cromática` (0/5):** Pasivo: Desbloquea +1 color de tinta y +1 fondo de carta por punto.
- **T4 (Ultimate): `Elocuencia` (0/1):** **Activa:** El próximo mensaje tiene un impacto emocional aumentado (crítico social). **[Cooldown: 24h]**

**Clase: Mercader Interdimensional (Maestría en Recursos)**
- **T1: `Negociante Experto` (0/5):** Reduce coste de regalos on-chain 2% por punto.
- **T2: `Prueba Convincente` (0/3):** La evidencia para un regalo puede ser +1 foto/punto.
- **T3 (Elección Estratégica):**
    - **`Red de Contactos` (0/5):** Pasivo: Recibes +1 Token de Intimidad/semana por cada 2 puntos invertidos.
    - **`Logística de Regalos` (0/5):** Pasivo: Reduce el 'delay de procesamiento' de los regalos on-chain en 5% por punto.
- **T4 (Ultimate): `Ofrenda Generosa` (0/1):** **Activa:** Envía un regalo on-chain sin coste de tokens. **[Cooldown: 7 días]**

### 4.2. Árbol de la IA: "El Consejero de Silicio"
*(Mejoras con "Datos de Entrenamiento")*

**Rama: Analista de Conversación**
- **T1: `Detector de Tono` (0/5):** +10% de precisión/punto para detectar emociones.
- **T2: `Memoria a Largo Plazo` (0/3):** IA recuerda +5 temas clave por punto.
- **T3 (Ultimate): `Oráculo del Silencio` (0/1):** **Activa:** Predice la probabilidad de 'ghosting'. **[Cooldown: 48h por chat]**

**Rama: Soporte Proactivo**
- **T1: `Corrector de Estilo` (0/5):** IA sugiere mejoras de redacción.
- **T2: `Rompehielos Contextual` (0/3):** IA sugiere +1 primera frase/punto.
- **T3 (Ultimate): `Ensayo y Error` (0/1):** **Activa:** Simula el resultado emocional de un mensaje antes de enviarlo. **[Cooldown: 1 vez por carta]**

### 4.3. Árbol de la Amistad: "El Vínculo"
*(Progreso colaborativo y lineal, desbloquea capacidades)*

- **Nivel 1: Extraños Conectados:** Solo texto. Delay completo.
- **Nivel 2: Corresponsales:** Desbloquea la habilidad de **Solicitar Foto**. Límite: 1 solicitud/3 días. Requiere un Token de Confianza que se regenera lentamente.
- **Nivel 3: Confidentes:** Desbloquea **Enviar Foto** (si es aceptada) y **Solicitar Nota de Voz**. Límite: 1 solicitud/2 días.
- **Nivel 4: Vínculo Fuerte:** Desbloquea **Enviar Nota de Voz**. Los límites de solicitud se reducen a 1 por día.
- **Nivel 5: Vínculo Inquebrantable:** Las fotos y notas de voz ya no requieren tokens ni tienen cooldowns. Desbloquean un chat secundario sin delay para emergencias.

## 5. Planes de Progresión

- **XP de Usuario:** Se gana con interacciones exitosas (respuestas recibidas), bonificadas por distancia y paciencia. Se usa para el Árbol del Emisario.
- **Datos de Entrenamiento (IA):** Se ganan cuando los consejos de la IA resultan en un éxito, o cuando predice correctamente un resultado. Se usa para mejorar el Árbol de la IA.
- **Puntos de Vínculo:** Se ganan con cada intercambio de mensajes y masivamente al aceptar solicitudes de intimidad (fotos/voz) y completar regalos. Son específicos de cada relación y se usan para subir de nivel el Árbol de Amistad.

## 6. Arquitectura Técnica en Flow

- **Mensajes:** Off-chain por privacidad y coste. Se almacenan en una base de datos encriptada.
- **Activos On-Chain (NFTs y Recursos):**
    - **`Sello Personalizado`:** Un NFT estándar (ERC-721) en la cuenta del usuario.
    - **`El Vínculo`:** Un **Recurso** complejo en Cadence, almacenado en una cuenta compartida o gestionado por un contrato que permite la copropiedad. Sus metadatos (arte, capítulos del Códice, estadísticas) se actualizan con las transacciones.
    - **`Regalos`:** Transacciones on-chain que interactúan con contratos de tokens (FLOW, FUSD) y registran la prueba de entrega.
- **IA:** Un modelo de lenguaje (ej: Llama 3) hosteado off-chain, que recibe datos anonimizados para procesar y devolver análisis.
- **Lógica de Cooldowns y Tokens:** Gestionada por el contrato principal para asegurar la integridad de las reglas del juego.

## 7. Plan de MVP en 7 Días

**Objetivo:** Demostrar el bucle central: **Mensaje -> Progresión del Vínculo -> Evolución del NFT.**

- **Día 1-2: El Contrato del Vínculo.**
    - Crear el Recurso `Vínculo` en Cadence con metadatos básicos (contador de mensajes, nivel 1).
    - Implementar la lógica para que dos cuentas puedan mintear y compartir un Vínculo.
- **Día 3-4: Bucle de Mensajería.**
    - Sistema de mensajería off-chain simple.
    - Cada respuesta exitosa llama a una transacción en Flow para incrementar el contador `Mensajes_Intercambiados` en el Vínculo NFT.
- **Día 5-6: Primera Evolución y Habilidad.**
    - Implementar la habilidad más simple: `Correo Prioritario`.
    - La UI debe mostrar el Vínculo NFT con su contador de mensajes.
    - La IA genera un "Capítulo 1" estático y lo guarda en los metadatos del NFT.
- **Día 7: Demo y Polish.**
    - Crear una UI simple que muestre dos perfiles, su Vínculo NFT compartido, su único capítulo de historia, y cómo el contador de mensajes sube en tiempo real (después de una transacción).
    - Demostrar que el núcleo on-chain funciona. 