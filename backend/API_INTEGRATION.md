# API Integration Guide - Frontend

Esta guía muestra cómo integrar el frontend con el backend de **La Red de Autómatas**.

## 🚀 Base URL

```
Development: http://localhost:8080
Production: https://your-backend-url.run.app
```

## 🔐 Flujo de Registro de Usuario

### 1. Registrar nuevo usuario

```javascript
// POST /api/users/register
const registerUser = async (address, displayName, publicKey) => {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,           // Flow wallet address (required)
      displayName,       // Optional display name
      publicKey          // Optional encryption key
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Usuario registrado:', result.data.user);
    console.log('Transacción Flow:', result.data.transaction);
  }
  
  return result;
};

// Ejemplo de uso
await registerUser(
  '0x1234567890abcdef',
  'Mi Nombre Rebelde',
  'encryption_public_key_optional'
);
```

### 2. Obtener información de usuario

```javascript
// GET /api/users/:address
const getUser = async (address) => {
  const response = await fetch(`/api/users/${address}`);
  const result = await response.json();
  
  return result.success ? result.data : null;
};
```

### 3. Buscar usuarios

```javascript
// GET /api/users/search?q=query
const searchUsers = async (query, limit = 20) => {
  const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  const result = await response.json();
  
  return result.success ? result.data : [];
};

// Buscar por nombre
const users = await searchUsers('Emisario');

// Buscar por dirección
const user = await searchUsers('0x1234567890abcdef');
```

## 💬 Sistema de Mensajería

### 1. Enviar mensaje con delay

```javascript
// POST /api/messages
const sendMessage = async (recipientAddress, content, delayMinutes = 0) => {
  // El contenido debe estar cifrado antes de enviarlo
  const encryptedContent = await encryptMessage(content, recipientAddress);
  
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientAddress,
      encryptedContent,
      delayMinutes
    })
  });
  
  const result = await response.json();
  return result;
};

// Ejemplo: Mensaje con delay de 30 minutos
await sendMessage(
  '0x2222222222222222',
  'Hola compañero de la resistencia',
  30
);
```

### 2. Obtener mensajes recibidos

```javascript
// GET /api/messages/:address
const getMessages = async (userAddress) => {
  const response = await fetch(`/api/messages/${userAddress}`);
  const result = await response.json();
  
  if (result.success) {
    // Descifrar mensajes
    const decryptedMessages = await Promise.all(
      result.data.map(async (msg) => ({
        ...msg,
        content: await decryptMessage(msg.encryptedContent, userAddress)
      }))
    );
    
    return decryptedMessages;
  }
  
  return [];
};
```

## 🔗 Sistema de Bonds (Vínculos)

### 1. Crear nuevo bond

```javascript
// POST /api/bonds/create
const createBond = async (initiatorAddress, partnerAddress) => {
  const response = await fetch('/api/bonds/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initiatorAddress,
      partnerAddress
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Bond creado, transacción:', result.data.transaction);
    // El bond se creará on-chain cuando la transacción se complete
  }
  
  return result;
};
```

### 2. Obtener información de bond

```javascript
// GET /api/bonds/:bondId
const getBond = async (bondId) => {
  const response = await fetch(`/api/bonds/${bondId}`);
  const result = await response.json();
  
  return result.success ? result.data : null;
};
```

## 🔧 Funciones de Cifrado (Ejemplo)

```javascript
// Ejemplo básico de cifrado (implementar según necesidades)
class EncryptionService {
  async encryptMessage(content, recipientAddress) {
    // Obtener clave pública del destinatario
    const recipient = await getUser(recipientAddress);
    
    if (!recipient?.publicKey) {
      throw new Error('Recipient public key not found');
    }
    
    // Cifrar usando la clave pública (implementar crypto)
    // Este es un placeholder - usar librerías como NaCl, WebCrypto, etc.
    const encrypted = btoa(content); // BASE64 simple - NO USAR EN PRODUCCIÓN
    
    return encrypted;
  }
  
  async decryptMessage(encryptedContent, userAddress) {
    // Descifrar usando la clave privada del usuario
    // Placeholder - implementar descifrado real
    const decrypted = atob(encryptedContent);
    
    return decrypted;
  }
}
```

## 🎮 Flujo Completo del Juego

### Registro e inicio de conversación:

```javascript
class GameClient {
  constructor(backendUrl) {
    this.baseUrl = backendUrl;
    this.currentUser = null;
  }
  
  // 1. Registrar usuario
  async register(walletAddress, displayName) {
    const result = await this.apiCall('/api/users/register', 'POST', {
      address: walletAddress,
      displayName
    });
    
    if (result.success) {
      this.currentUser = result.data.user;
    }
    
    return result;
  }
  
  // 2. Buscar otros usuarios
  async findPartners(query) {
    return await this.apiCall(`/api/users/search?q=${query}`);
  }
  
  // 3. Iniciar conversación (crear bond)
  async startConversation(partnerAddress) {
    const bondResult = await this.apiCall('/api/bonds/create', 'POST', {
      initiatorAddress: this.currentUser.address,
      partnerAddress
    });
    
    if (bondResult.success) {
      console.log('Bond creado, pueden empezar a conversar');
    }
    
    return bondResult;
  }
  
  // 4. Enviar mensaje
  async sendMessage(recipientAddress, content, delayMinutes = 0) {
    return await this.apiCall('/api/messages', 'POST', {
      recipientAddress,
      encryptedContent: await this.encrypt(content, recipientAddress),
      delayMinutes
    });
  }
  
  // 5. Recibir mensajes
  async checkMessages() {
    if (!this.currentUser) return [];
    
    const result = await this.apiCall(`/api/messages/${this.currentUser.address}`);
    
    if (result.success) {
      // Descifrar mensajes
      return await Promise.all(
        result.data.map(async (msg) => ({
          ...msg,
          content: await this.decrypt(msg.encryptedContent)
        }))
      );
    }
    
    return [];
  }
  
  // Helper method
  async apiCall(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    return await response.json();
  }
}
```

### Ejemplo de uso:

```javascript
const game = new GameClient('http://localhost:8080');

// Registrar usuario
await game.register('0x1234567890abcdef', 'Rebelde Digital');

// Buscar compañeros
const partners = await game.findPartners('Emisario');

// Iniciar conversación
await game.startConversation(partners[0].address);

// Enviar mensaje con delay
await game.sendMessage(
  partners[0].address,
  'Hola, soy nuevo en la resistencia',
  15 // 15 minutos de delay
);

// Verificar mensajes recibidos
const messages = await game.checkMessages();
console.log('Mensajes recibidos:', messages);
```

## 🔍 Estado del Sistema

```javascript
// GET /api/system/stats
const getSystemStats = async () => {
  const response = await fetch('/api/system/stats');
  const result = await response.json();
  
  if (result.success) {
    console.log('Mensajes en cola:', result.data.messageQueue);
    console.log('Uptime del sistema:', result.data.uptime);
  }
  
  return result;
};
```

## 🚨 Manejo de Errores

```javascript
const handleApiError = (result) => {
  if (!result.success) {
    console.error('Error de API:', result.error);
    
    // Mostrar error al usuario
    showNotification('Error: ' + result.error, 'error');
    
    return false;
  }
  
  return true;
};

// Uso
const result = await sendMessage(address, content);
if (handleApiError(result)) {
  showNotification('Mensaje enviado exitosamente', 'success');
}
```

## 📝 Notas Importantes

1. **Cifrado**: El ejemplo usa Base64 simple. Implementar cifrado real con NaCl o similar.
2. **Wallets**: El backend simula firmas. En producción, integrar con Flow wallets reales.
3. **Delays**: Los mensajes se procesan cada minuto por Cloud Scheduler.
4. **Rate Limiting**: Implementar throttling en el frontend para evitar spam.
5. **Offline**: Considerar cache local para mensajes cuando no hay conexión.

## 🔗 Links Útiles

- [Flow FCL Documentation](https://developers.flow.com/tools/fcl-js)
- [Flow Wallet Integration](https://developers.flow.com/tools/fcl-js/authentication)
- [NaCl Encryption](https://nacl.cr.yp.to/) 