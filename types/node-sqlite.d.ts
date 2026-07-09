// Ambient declaration for Node's built-in SQLite (node:sqlite), which is not
// yet included in @types/node v20. Runtime support exists on Node 22+.
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string, options?: unknown);
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: unknown[]): { changes: number; lastInsertRowid: number };
      get(...params: unknown[]): unknown;
      all(...params: unknown[]): unknown[];
    };
    close(): void;
  }
}
