export interface AuditLog {
    id: number;
    username: string;
    user_email: string | null;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    module: 'USER' | 'ROLE' | 'MENU';
    resource_type: string;
    resource_id: string;
    detail: Record<string, unknown>;
    ip_address: string;
    timestamp: string;
    status: boolean;
    message: string;
  }
