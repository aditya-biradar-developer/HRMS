// API URL configuration for different environments
const getApiUrl = () => {
  // 1. Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Auto-detect production environment
  if (window.location.hostname.includes('onrender.com')) {
    // Replace 'your-backend-app' with your actual Render backend service name
    const backendUrl = window.location.hostname.replace(/^[^-]+-/, 'ai-hrms-backend-');
    return `https://${backendUrl}/api`;
  }
  
  // 3. Development fallback
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

// Log the API URL for debugging
console.log('🌐 API URL:', API_URL);

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  HR: 'hr',
  EMPLOYEE: 'employee',
  CANDIDATE: 'candidate'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  ON_LEAVE: 'on_leave'
};

export const LEAVE_TYPES = {
  SICK: 'sick',
  CASUAL: 'casual',
  ANNUAL: 'annual',
  UNPAID: 'unpaid'
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  REJECTED: 'rejected',
  HIRED: 'hired'
};

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Candidate'
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];