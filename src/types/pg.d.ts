declare module 'pg' {
    export class Pool {
        constructor(config?: { connectionString?: string });
        connect(): Promise<any>;
        query(text: string, params?: any[]): Promise<any>;
        end(): Promise<void>;
    }
}
