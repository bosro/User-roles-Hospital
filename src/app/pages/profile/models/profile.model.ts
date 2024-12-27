interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialization: string;
    department: string;
    bio: string;
    stats: {
      totalPatients: number;
      appointmentsThisMonth: number;
      yearsOfService: number;
    };
    preferences: UserPreferences;
  }
  
  interface UserPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    darkMode: boolean;
    compactView: boolean;
  }
  
  interface LoginActivity {
    location: string;
    device: string;
    timestamp: Date;
    status: 'success' | 'failed';
    ipAddress?: string;
  }