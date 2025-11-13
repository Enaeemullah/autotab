export interface SyncPayload<T = unknown> {
  entity: string;
  records: T[];
}

export interface SyncRequestPayload {
  timestamp: string;
  entities: SyncPayload[];
}

export interface SyncResponsePayload {
  timestamp: string;
  entities: SyncPayload[];
}

export interface SyncResult {
  applied: number;
  conflicts: number;
}
