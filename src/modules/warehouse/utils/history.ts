export type EventType =
  | "create"
  | "update"
  | "delete"
  | "import"
  | "export"
  | "adjust"
  | "price_change"
  | "image_change";

export interface HistoryEvent {
  id: string;
  createdAt: string; // ISO string
  type: EventType;
  entityType: "product" | "category";
  entityId: string;
  entityName: string;
  actor: string;
  delta?: { quantity?: number; price?: number };
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  note?: string;
}

const STORAGE_KEY = "warehouse_history_events";

export function getHistoryEvents(): HistoryEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as HistoryEvent[];
    return [];
  } catch {
    return [];
  }
}

export function addHistoryEvent(event: Omit<HistoryEvent, "id" | "createdAt">) {
  const list = getHistoryEvents();
  const full: HistoryEvent = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...event,
  };
  list.unshift(full); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return full;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}


