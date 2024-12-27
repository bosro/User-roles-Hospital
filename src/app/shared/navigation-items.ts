  export const navigationItems = [
    {
      label: 'Dashboard',
      icon: 'ri-dashboard-line',
      route: '/dashboard'
    },
    {
      label: 'Patients',
      icon: 'ri-user-heart-line',
      route: '/patients',
      items: [
        { label: 'Patient List', route: '/patients/list' },
        { label: 'Add Patient', route: '/patients/add' },
        { label: 'Patient Records', route: '/patients/records' }
      ]
    },
    {
      label: 'Appointments',
      icon: 'ri-calendar-check-line',
      route: '/appointments',
      items: [
        { label: 'Calendar', route: '/appointments/calendar' },
        { label: 'Schedule', route: '/appointments/schedule' },
        { label: 'Waiting List', route: '/appointments/waiting-list' }
      ]
    },
    {
      label: 'Doctors',
      icon: 'ri-user-star-line',
      route: '/doctors',
      items: [
        { label: 'Doctor List', route: '/doctors/list' },
        { label: 'Schedules', route: '/doctors/schedules' },
        { label: 'Departments', route: '/doctors/departments' }
      ]
    },
    {
      label: 'Inventory',
      icon: 'ri-medicine-bottle-line',
      route: '/inventory',
      items: [
        { label: 'Medicines', route: '/inventory/medicines' },
        { label: 'Equipment', route: '/inventory/equipment' },
        { label: 'Supplies', route: '/inventory/supplies' }
      ]
    },
    {
      label: 'Billing',
      icon: 'ri-bill-line',
      route: '/billing',
      items: [
        { label: 'Invoices', route: '/billing/invoices' },
        { label: 'Payments', route: '/billing/payments' },
        { label: 'Insurance', route: '/billing/insurance' }
      ]
    },
    {
      label: 'Reports',
      icon: 'ri-file-chart-line',
      route: '/reports',
      items: [
        { label: 'Financial', route: '/reports/financial' },
        { label: 'Patient', route: '/reports/patient' },
        { label: 'Inventory', route: '/reports/inventory' }
      ]
    },
    {
      label: 'Settings',
      icon: 'ri-settings-4-line',
      route: '/settings'
    }
  ];
  