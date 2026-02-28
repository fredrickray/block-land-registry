// Simulated blockchain for land registry prototype

export interface PropertyRecord {
  propertyId: string;
  location: string;
  ownerName: string;
  ownerContact: string;
  registeredAt: number;
  hash: string;
}

export interface Transaction {
  id: string;
  blockIndex: number;
  type: 'REGISTER' | 'TRANSFER';
  propertyId: string;
  from: string;
  to: string;
  timestamp: number;
  hash: string;
  previousHash: string;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

// Simple hash function (simulated SHA-256 style)
export function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // Create a longer hash that looks like SHA-256
  return `0x${hex}${generateSimpleHash(data + hex)}${hex.split('').reverse().join('')}`;
}

function generateSimpleHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0') +
    Math.abs(h * 31).toString(16).padStart(8, '0') +
    Math.abs(h * 37).toString(16).padStart(8, '0') +
    Math.abs(h * 41).toString(16).padStart(8, '0');
}

// Blockchain state store
const STORAGE_KEY = 'land_registry_blockchain';

interface BlockchainState {
  properties: Record<string, PropertyRecord>;
  transactions: Transaction[];
  blocks: Block[];
  blockIndex: number;
}

function getDefaultState(): BlockchainState {
  return {
    properties: {},
    transactions: [],
    blocks: [{
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      hash: generateHash('genesis-block'),
      nonce: 0,
    }],
    blockIndex: 1,
  };
}

function loadState(): BlockchainState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return getDefaultState();
}

function saveState(state: BlockchainState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Seed demo data
export function seedDemoData() {
  const state = loadState();
  if (Object.keys(state.properties).length > 0) return state;

  const demoProperties = [
    { propertyId: 'PROP-001', location: 'Plot 15, Block A, Victoria Island, Lagos', ownerName: 'Adebayo Ogunlesi', ownerContact: 'adebayo@email.com' },
    { propertyId: 'PROP-002', location: 'No. 42 Crescent Road, Wuse II, Abuja', ownerName: 'Chioma Nwosu', ownerContact: 'chioma@email.com' },
    { propertyId: 'PROP-003', location: 'Lot 7, GRA Phase 2, Port Harcourt', ownerName: 'Ibrahim Musa', ownerContact: 'ibrahim@email.com' },
  ];

  demoProperties.forEach((p, i) => {
    const hash = generateHash(JSON.stringify(p));
    state.properties[p.propertyId] = { ...p, registeredAt: Date.now() - (3 - i) * 86400000, hash };

    const prevHash = state.blocks[state.blocks.length - 1].hash;
    const tx: Transaction = {
      id: `TX-${Date.now()}-${i}`,
      blockIndex: state.blockIndex,
      type: 'REGISTER',
      propertyId: p.propertyId,
      from: 'SYSTEM',
      to: p.ownerName,
      timestamp: Date.now() - (3 - i) * 86400000,
      hash: generateHash(`register-${p.propertyId}-${i}`),
      previousHash: prevHash,
    };

    const block: Block = {
      index: state.blockIndex,
      timestamp: tx.timestamp,
      transactions: [tx],
      previousHash: prevHash,
      hash: generateHash(`block-${state.blockIndex}-${tx.hash}`),
      nonce: Math.floor(Math.random() * 100000),
    };

    state.transactions.push(tx);
    state.blocks.push(block);
    state.blockIndex++;
  });

  // Add a transfer
  const transferTx: Transaction = {
    id: `TX-${Date.now()}-transfer`,
    blockIndex: state.blockIndex,
    type: 'TRANSFER',
    propertyId: 'PROP-001',
    from: 'Adebayo Ogunlesi',
    to: 'Fatima Bello',
    timestamp: Date.now() - 43200000,
    hash: generateHash('transfer-PROP-001'),
    previousHash: state.blocks[state.blocks.length - 1].hash,
  };
  state.properties['PROP-001'].ownerName = 'Fatima Bello';
  state.properties['PROP-001'].ownerContact = 'fatima@email.com';
  state.properties['PROP-001'].hash = generateHash(JSON.stringify(state.properties['PROP-001']));

  const transferBlock: Block = {
    index: state.blockIndex,
    timestamp: transferTx.timestamp,
    transactions: [transferTx],
    previousHash: state.blocks[state.blocks.length - 1].hash,
    hash: generateHash(`block-${state.blockIndex}-${transferTx.hash}`),
    nonce: Math.floor(Math.random() * 100000),
  };

  state.transactions.push(transferTx);
  state.blocks.push(transferBlock);
  state.blockIndex++;

  saveState(state);
  return state;
}

export function getState(): BlockchainState {
  return loadState();
}

export function registerProperty(propertyId: string, location: string, ownerName: string, ownerContact: string): { success: boolean; message: string; hash?: string } {
  const state = loadState();

  if (state.properties[propertyId]) {
    return { success: false, message: 'Property ID already exists on the blockchain.' };
  }

  const hash = generateHash(JSON.stringify({ propertyId, location, ownerName, ownerContact, timestamp: Date.now() }));
  state.properties[propertyId] = { propertyId, location, ownerName, ownerContact, registeredAt: Date.now(), hash };

  const prevHash = state.blocks[state.blocks.length - 1].hash;
  const tx: Transaction = {
    id: `TX-${Date.now()}`,
    blockIndex: state.blockIndex,
    type: 'REGISTER',
    propertyId,
    from: 'SYSTEM',
    to: ownerName,
    timestamp: Date.now(),
    hash: generateHash(`register-${propertyId}-${Date.now()}`),
    previousHash: prevHash,
  };

  const block: Block = {
    index: state.blockIndex,
    timestamp: Date.now(),
    transactions: [tx],
    previousHash: prevHash,
    hash: generateHash(`block-${state.blockIndex}-${tx.hash}`),
    nonce: Math.floor(Math.random() * 100000),
  };

  state.transactions.push(tx);
  state.blocks.push(block);
  state.blockIndex++;
  saveState(state);

  return { success: true, message: 'Property registered on blockchain.', hash };
}

export function transferOwnership(propertyId: string, newOwnerName: string, newOwnerContact: string): { success: boolean; message: string } {
  const state = loadState();
  const property = state.properties[propertyId];

  if (!property) {
    return { success: false, message: 'Property not found on blockchain.' };
  }

  const previousOwner = property.ownerName;
  property.ownerName = newOwnerName;
  property.ownerContact = newOwnerContact;
  property.hash = generateHash(JSON.stringify({ ...property, timestamp: Date.now() }));

  const prevHash = state.blocks[state.blocks.length - 1].hash;
  const tx: Transaction = {
    id: `TX-${Date.now()}`,
    blockIndex: state.blockIndex,
    type: 'TRANSFER',
    propertyId,
    from: previousOwner,
    to: newOwnerName,
    timestamp: Date.now(),
    hash: generateHash(`transfer-${propertyId}-${Date.now()}`),
    previousHash: prevHash,
  };

  const block: Block = {
    index: state.blockIndex,
    timestamp: Date.now(),
    transactions: [tx],
    previousHash: prevHash,
    hash: generateHash(`block-${state.blockIndex}-${tx.hash}`),
    nonce: Math.floor(Math.random() * 100000),
  };

  state.transactions.push(tx);
  state.blocks.push(block);
  state.blockIndex++;
  saveState(state);

  return { success: true, message: `Ownership transferred from ${previousOwner} to ${newOwnerName}.` };
}

export function verifyProperty(propertyId: string): { found: boolean; property?: PropertyRecord; verified: boolean; transactions: Transaction[] } {
  const state = loadState();
  const property = state.properties[propertyId];

  if (!property) {
    return { found: false, verified: false, transactions: [] };
  }

  const txs = state.transactions.filter(t => t.propertyId === propertyId);
  return { found: true, property, verified: true, transactions: txs };
}

export function getAllTransactions(): Transaction[] {
  return loadState().transactions;
}

export function getAllProperties(): PropertyRecord[] {
  return Object.values(loadState().properties);
}

export function getBlocks(): Block[] {
  return loadState().blocks;
}

export function resetBlockchain() {
  localStorage.removeItem(STORAGE_KEY);
}
