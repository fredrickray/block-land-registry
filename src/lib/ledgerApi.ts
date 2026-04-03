// Frontend API client for the backend ledger.
// Keeps the same data shapes as `src/pages/*` so the UI can render without changes to components.

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
  type: "REGISTER" | "TRANSFER";
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

// Simple hash function (same as UI prototype)
export function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  // Create a longer hash that looks like SHA-256
  return `0x${hex}${generateSimpleHash(data + hex)}${hex.split("").reverse().join("")}`;
}

function generateSimpleHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (
    (h >>> 0).toString(16).padStart(8, "0") +
    Math.abs(h * 31).toString(16).padStart(8, "0") +
    Math.abs(h * 37).toString(16).padStart(8, "0") +
    Math.abs(h * 41).toString(16).padStart(8, "0")
  );
}

export interface TransferRequest {
  id: string;
  propertyId: string;
  buyerName: string;
  buyerContact: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: number;
  resolvedAt?: number;
}

export interface BlockchainState {
  properties: Record<string, PropertyRecord>;
  transactions: Transaction[];
  blocks: Block[];
  blockIndex: number;
  transferRequests: TransferRequest[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:4444";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const body = (await res.json()) as { error?: { message?: string } };
      throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
    }
    throw new Error(`Request failed (${res.status})`);
  }

  if (contentType.includes("application/json")) return (await res.json()) as T;
  // Some endpoints return 204/no content (not currently used, but safe).
  return undefined as T;
}

// Ledger
export async function seedDemoData() {
  await apiFetch<{ success: boolean; stats?: unknown }>("/api/ledger/seed", { method: "POST" });
}

export async function resetBlockchain() {
  await apiFetch<{ success: boolean }>("/api/ledger/reset", { method: "POST" });
}

export async function getState(): Promise<BlockchainState> {
  // Returns the full state object used for rendering.
  return apiFetch<BlockchainState>("/api/state", { method: "GET" });
}

export async function registerProperty(
  propertyId: string,
  location: string,
  ownerName: string,
  ownerContact: string,
): Promise<{ success: boolean; message: string; hash?: string }> {
  return apiFetch<{ success: boolean; message: string; hash?: string }>("/api/properties/register", {
    method: "POST",
    body: JSON.stringify({ propertyId, location, ownerName, ownerContact }),
  });
}

export async function transferOwnership(
  propertyId: string,
  newOwnerName: string,
  newOwnerContact: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/properties/${encodeURIComponent(propertyId)}/transfer`,
    {
      method: "POST",
      body: JSON.stringify({ newOwnerName, newOwnerContact }),
    },
  );
}

export async function verifyProperty(
  propertyId: string,
): Promise<{
  found: boolean;
  property?: PropertyRecord;
  verified: boolean;
  transactions: Transaction[];
}> {
  return apiFetch(`/api/properties/${encodeURIComponent(propertyId)}/verify`);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/transactions");
}

export async function getAllProperties(): Promise<PropertyRecord[]> {
  return apiFetch<PropertyRecord[]>("/api/properties");
}

export async function getBlocks(): Promise<Block[]> {
  return apiFetch<Block[]>("/api/blocks");
}

// Buyer helpers
export async function requestTransfer(
  propertyId: string,
  buyerName: string,
  buyerContact: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>("/api/transfers/request", {
    method: "POST",
    body: JSON.stringify({ propertyId, buyerName, buyerContact }),
  });
}

export async function getTransferRequests(): Promise<TransferRequest[]> {
  return apiFetch<TransferRequest[]>("/api/transfers/requests");
}

export async function getTransferRequestsForSeller(
  sellerName: string,
): Promise<TransferRequest[]> {
  return apiFetch<TransferRequest[]>(
    `/api/transfers/requests/seller/${encodeURIComponent(sellerName)}`,
  );
}

export async function approveTransferRequest(
  requestId: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/transfers/requests/${encodeURIComponent(requestId)}/approve`,
    { method: "POST" },
  );
}

export async function rejectTransferRequest(
  requestId: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/transfers/requests/${encodeURIComponent(requestId)}/reject`,
    { method: "POST" },
  );
}

export async function getPropertiesByOwner(ownerName: string): Promise<PropertyRecord[]> {
  return apiFetch<PropertyRecord[]>(
    `/api/properties/owner/${encodeURIComponent(ownerName)}`,
  );
}

export async function getPurchaseHistory(buyerName: string): Promise<Transaction[]> {
  const name = buyerName.trim();
  return apiFetch<Transaction[]>(
    `/api/transactions/purchase-history?buyerName=${encodeURIComponent(name)}`,
  );
}

export async function searchProperties(query: string): Promise<PropertyRecord[]> {
  return apiFetch<PropertyRecord[]>(
    `/api/properties/search?query=${encodeURIComponent(query ?? "")}`,
  );
}

