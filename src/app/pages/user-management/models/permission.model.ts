export interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
  }
  
  export interface UserPermission {
    userId: string;
    permissionId: string;
    granted: boolean;
    grantedBy?: string;
    grantedAt?: Date;
  }
  