# 🚀 Guía de Setup - Frontend La Resistencia

## ✅ Estado Actual del Frontend

El frontend está **completamente listo** para el flujo completo de registro de emisarios que incluye:

### 🔥 Funcionalidades Implementadas

1. **Registro Completo de Emisario**:
   - ✅ Conectar wallet Flow
   - ✅ Capturar nombre y país del emisario
   - ✅ Generar par de claves criptográficas (RSA-OAEP 2048)
   - ✅ Crear Emisario en blockchain
   - ✅ Guardar clave pública on-chain
   - ✅ Guardar datos en backend (nombre + país)

2. **Servicios Integrados**:
   - ✅ **FlowService**: Manejo completo de blockchain
   - ✅ **CryptoService**: Generación y manejo de claves E2E
   - ✅ **AuthStore**: Gestión de estado de usuario
   - ✅ **GameStore**: Mensajería y vínculos

### 🎯 Flujo de Registro Paso a Paso

Cuando el usuario hace el registro, automáticamente:

```
1. 🔐 Genera par de claves RSA-OAEP 2048
2. 💾 Guarda clave privada en localStorage
3. ⛓️  Ejecuta setup_account.cdc en blockchain
4. 📢 Ejecuta set_public_key.cdc con clave pública
5. 💾 POST al backend con nombre + país + address
```

### 📁 Archivos Clave

- **`src/services/flowService.ts`**: Integración blockchain completa
- **`src/services/cryptoService.ts`**: E2E encryption
- **`src/stores/authStore.ts`**: Estado de autenticación
- **`src/pages/DashboardPage.tsx`**: Modal de registro con país
- **`src/config/countries.ts`**: Lista de países

### 🔧 Configuración Necesaria

1. **Variables de Entorno**:
```bash
VITE_API_URL=http://localhost:8080
```

2. **Backend Endpoint Requerido**:
```
POST /api/users/register
{
  "address": "0x...",
  "displayName": "NombreEmisario",
  "country": "MX",
  "publicKey": "-----BEGIN PUBLIC KEY-----..."
}
```

### 🎮 Uso del Frontend

1. **Iniciar desarrollo**:
```bash
cd frontend
npm run dev
```

2. **El usuario ve**:
   - Pantalla de bienvenida épica con lore
   - Botón "CONECTAR_WALLET"
   - Modal de registro con nombre + país
   - Proceso automático de setup completo

3. **Flujos automáticos**:
   - Usuario conecta wallet → Detecta si está registrado
   - Si no está registrado → Muestra modal
   - Usuario completa formulario → Ejecuta proceso completo
   - Éxito → Navega al dashboard

### 🛡️ Seguridad Implementada

- **Claves privadas**: Solo en localStorage del usuario
- **Encriptación**: RSA-OAEP 2048 bits
- **Blockchain**: Transacciones firmadas por wallet del usuario
- **Backend**: Solo recibe datos públicos (nombre, país, clave pública)

### 📊 Estados de Usuario

El sistema maneja automáticamente:

```typescript
interface User {
  address: string;
  displayName?: string;
  publicKey?: string;
  isRegistered?: boolean;
  level?: number;
  xp?: number;
  id?: number;
}
```

### 🎨 UI/UX Implementada

- **Modal de registro** con explicación del proceso
- **Lista de países** enfocada en Latinoamérica
- **Indicadores visuales** del progreso
- **Manejo de errores** con mensajes claros
- **Estados de carga** durante transacciones

## 🚀 ¿Está Todo Listo?

**SÍ**, el frontend está completamente preparado para:

1. ✅ Conectar wallet Flow
2. ✅ Crear emisario con nombre y país
3. ✅ Generar claves criptográficas
4. ✅ Guardar clave pública en blockchain
5. ✅ Integrar con backend para datos adicionales

Solo necesitas:
1. **Backend corriendo** en `localhost:8080`
2. **Endpoint** `/api/users/register` funcionando
3. **Contratos desplegados** en Flow Testnet

¡El frontend está listo para el setup completo! 🎉 