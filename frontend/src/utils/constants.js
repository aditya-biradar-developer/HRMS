// API URL configuration for different environments
const getApiUrl = () => {
  // Use environment variable if set (production and development)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    console.log('🌐 Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Fallback for local development
  const fallbackUrl = 'http://localhost:5000/api';
  console.log('🌐 Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

// Export the API URL and log it
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