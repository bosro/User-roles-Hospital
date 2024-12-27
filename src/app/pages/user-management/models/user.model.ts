export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;           
  role: UserRole;        
  department?: string;     
  status: 'active' | 'inactive' | 'pending' | 'blocked';  
  lastLogin?: Date;        
  createdAt: Date;       
  permissions: string[];
  profileImage?: string;  
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'staff' | 'receptionist';

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
}


