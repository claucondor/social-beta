# La Red de Autómatas - Backend

Backend modular, seguro y escalable para el juego social on-chain "La Red de Autómatas". Desarrollado con Node.js, TypeScript, Hono y completamente containerizado para Google Cloud Run.

## 🏗️ Arquitectura

El backend actúa como el "operador logístico" de la red clandestina, gestionando:

- **Comunicación off-chain**: Sistema de mensajería con delays programables
- **Lógica de juego**: Procesamiento de eventos y evolución de Bonds NFT
- **Orquestación on-chain**: Interacción con contratos de Flow blockchain
- **Generación de contenido**: Informes de misión e imágenes SVG con IA

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+ con TypeScript
- **Framework Web**: Hono (ultra-rápido y compatible con Cloud Run)
- **Base de Datos**: Google Firestore (serverless, sin configuración)
- **Blockchain**: Flow FCL para interacciones on-chain
- **IA**: Google Vertex AI (Gemini para texto e imágenes)
- **Storage**: Google Cloud Storage para assets
- **Containerización**: Docker multi-stage optimizado
- **Despliegue**: Google Cloud Run con autenticación automática

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración y variables de entorno
│   └── index.ts      # Config centralizada con validación Zod
├── services/         # Lógica de negocio principal
│   ├── flow.service.ts     # Interacciones con Flow blockchain
│   ├── message.service.ts  # Cola de mensajes con Firestore
│   ├── ia.service.ts       # Generación de contenido con Vertex AI
│   └── scheduler.service.ts # Tareas programadas y mantenimiento
├── api/              # Rutas y controladores HTTP
│   └── routes.ts     # Endpoints REST con Hono
├── types/            # Definiciones de tipos TypeScript
│   └── index.ts      # Interfaces y tipos compartidos
└── index.ts          # Punto de entrada de la aplicación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Docker (para containerización)
- Cuenta de Google Cloud Platform
- Cuenta de Flow (testnet/mainnet)

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd la-red-de-automatas-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus valores específicos
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   npm start
   ```

### Configuración de Variables de Entorno

```bash
# Google Cloud Platform
GCP_PROJECT_ID=tu-proyecto-gcp

# Flow Blockchain
FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
FLOW_NETWORK=testnet
FLOW_ORACLE_ADDRESS=0x1234567890abcdef
FLOW_ORACLE_PRIVATE_KEY=tu-clave-privada-flow

# Cloud Storage
GCS_BUCKET_NAME=la-red-de-automatas-assets

# Configuración de aplicación
NODE_ENV=production
LOG_LEVEL=info
```

## 🐳 Containerización y Despliegue

### Build Docker Local

```bash
docker build -t la-red-de-automatas-backend .
docker run -p 8080:8080 --env-file .env la-red-de-automatas-backend
```

### Despliegue en Google Cloud Run

```bash
# Configurar gcloud CLI
gcloud config set project TU_PROYECTO_GCP

# Build y push a Container Registry
gcloud builds submit --tag gcr.io/TU_PROYECTO_GCP/la-red-de-automatas-backend

# Desplegar en Cloud Run
gcloud run deploy la-red-de-automatas-backend \
  --image gcr.io/TU_PROYECTO_GCP/la-red-de-automatas-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=TU_PROYECTO_GCP \
  --set-env-vars FLOW_NETWORK=testnet \
  --set-env-vars GCS_BUCKET_NAME=tu-bucket
```

## 📚 API Documentation

### Endpoints Principales

#### Salud del Sistema
- `GET /health` - Health check
- `GET /api/system/stats` - Estadísticas del sistema

#### Mensajería
- `POST /api/messages` - Crear mensaje con delay
- `GET /api/messages/:address` - Obtener mensajes de una dirección
- `GET /api/messages/stats` - Estadísticas de la cola

#### Scheduler (Cloud Scheduler)
- `POST /api/scheduler/process-queue` - Procesar cola de mensajes
- `POST /api/scheduler/process-bonds` - Procesar evoluciones de bonds
- `POST /api/scheduler/maintenance` - Ejecutar tareas de mantenimiento

#### Flow Blockchain
- `GET /api/bonds/:bondId` - Información de un Bond NFT
- `POST /api/bonds/:bondId/grant-xp` - Otorgar XP a usuario
- `GET /api/transactions/:txId/status` - Estado de transacción

#### Inteligencia Artificial
- `POST /api/ai/generate-report` - Generar informe de misión
- `POST /api/ai/generate-art` - Generar arte SVG
- `POST /api/ai/process-evolution/:bondId` - Procesar evolución completa

### Ejemplo de Uso

```javascript
// Crear mensaje con delay de 30 minutos
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientAddress: '0x1234567890abcdef',
    encryptedContent: 'mensaje_cifrado_base64',
    delayMinutes: 30
  })
});

// Generar arte para Bond
const artResponse = await fetch('/api/ai/generate-art', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    artSeed: ['mystery', 'connection', 'digital'],
    bondLevel: 3
  })
});
```

## ⚙️ Configuración de Cloud Scheduler

Para automatizar el procesamiento de mensajes:

```bash
# Crear job para procesar cola de mensajes cada minuto
gcloud scheduler jobs create http process-message-queue \
  --schedule="* * * * *" \
  --uri="https://tu-backend-url/api/scheduler/process-queue" \
  --http-method=POST \
  --headers="Content-Type=application/json"

# Crear job para mantenimiento diario
gcloud scheduler jobs create http daily-maintenance \
  --schedule="0 2 * * *" \
  --uri="https://tu-backend-url/api/scheduler/maintenance" \
  --http-method=POST \
  --headers="Content-Type=application/json"
```

## 🔒 Seguridad

- **Autenticación automática**: GCP Service Account para Firestore/Vertex AI
- **Secrets Management**: Google Secret Manager para claves privadas
- **CORS configurado**: Para permitir acceso desde frontend autorizado
- **Validación de input**: Zod para validación robusta de datos
- **Rate limiting**: Implementado a través de Cloud Run concurrency

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Linting
npm run lint
npm run lint:fix
```

## 📈 Monitoreo y Logs

Cloud Run proporciona métricas automáticas:
- **Request latency**
- **Request count**
- **Error rate**
- **Memory usage**
- **CPU utilization**

Logs disponibles en Google Cloud Logging.

## 🔧 Desarrollo

### Scripts Disponibles

- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Build para producción
- `npm start` - Ejecutar versión compilada
- `npm test` - Ejecutar tests
- `npm run lint` - Verificar código con ESLint

### Añadir Nuevas Funcionalidades

1. Definir tipos en `src/types/index.ts`
2. Implementar lógica en `src/services/`
3. Crear endpoints en `src/api/routes.ts`
4. Actualizar tests correspondientes

## 🤝 Contribución

1. Fork el repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.

## 🆘 Soporte

Para problemas y preguntas:
- Crear issue en GitHub
- Revisar logs de Cloud Run
- Verificar configuración de variables de entorno
- Consultar documentación de GCP/Flow

---

**La Red de Autómatas** - Conectando almas en la resistencia digital 🔗💙 