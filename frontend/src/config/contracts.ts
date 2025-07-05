/**
 * Contract Configuration - Frontend
 * Centraliza todos los nombres de contratos y addresses para fácil mantenimiento
 */

export const FLOW_CONFIG = {
  // Network configuration
  NETWORK: 'testnet',
  
  // Contract names
  CONTRACTS: {
    // Nuestros contratos
    CLANDESTINE_NETWORK: 'ClandestineNetworkV2',
    SKILL_REGISTRY: 'SkillRegistry', 
    GIFTS: 'Gifts',
    
    // Contratos de Flow
    NON_FUNGIBLE_TOKEN: 'NonFungibleToken',
    METADATA_VIEWS: 'MetadataViews',
    VIEW_RESOLVER: 'ViewResolver',
    FUNGIBLE_TOKEN: 'FungibleToken',
    FLOW_TOKEN: 'FlowToken'
  },
  
  // Deployed addresses
  ADDRESSES: {
    TESTNET: {
      DEPLOYER: '0x2444e6b4d9327f09',
      NON_FUNGIBLE_TOKEN: '0x631e88ae7f1d7c20',
      METADATA_VIEWS: '0x631e88ae7f1d7c20',
      VIEW_RESOLVER: '0x631e88ae7f1d7c20',
      FUNGIBLE_TOKEN: '0x9a0766d93b6608b7',
      FLOW_TOKEN: '0x7e60df042a9c0868'
    }
  }
};

/**
 * Helper para generar imports de contratos
 */
export const getContractImport = (contractName: keyof typeof FLOW_CONFIG.CONTRACTS) => {
  const name = FLOW_CONFIG.CONTRACTS[contractName];
  
  if (contractName === 'NON_FUNGIBLE_TOKEN') {
    return `import ${name} from ${FLOW_CONFIG.ADDRESSES.TESTNET.NON_FUNGIBLE_TOKEN}`;
  }
  if (contractName === 'METADATA_VIEWS') {
    return `import ${name} from ${FLOW_CONFIG.ADDRESSES.TESTNET.METADATA_VIEWS}`;
  }
  if (contractName === 'VIEW_RESOLVER') {
    return `import ${name} from ${FLOW_CONFIG.ADDRESSES.TESTNET.VIEW_RESOLVER}`;
  }
  if (contractName === 'FUNGIBLE_TOKEN') {
    return `import ${name} from ${FLOW_CONFIG.ADDRESSES.TESTNET.FUNGIBLE_TOKEN}`;
  }
  if (contractName === 'FLOW_TOKEN') {
    return `import ${name} from ${FLOW_CONFIG.ADDRESSES.TESTNET.FLOW_TOKEN}`;
  }
  
  return `import ${name} from ${FLOW_CONFIG.ADDRESSES.TESTNET.DEPLOYER}`;
};

/**
 * Genera el bloque de imports para transacciones
 */
export const generateImports = (contracts: (keyof typeof FLOW_CONFIG.CONTRACTS)[]) => {
  return contracts.map(contract => getContractImport(contract)).join('\n');
}; 