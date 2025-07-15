import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'john.employee@company.com',
    name: 'John Doe',
    role: 'employee',
    employeeId: 'EMP001',
    department: 'Engineering',
    manager: 'Jane Smith',
    phone: '+1 234 567 8901',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    email: 'sarah.hr@company.com',
    name: 'Sarah Wilson',
    role: 'hr',
    employeeId: 'HR001',
    department: 'Human Resources',
    phone: '+1 234 567 8902',
    joinDate: '2022-03-10'
  },
  {
    id: '3',
    email: 'mike.it@company.com',
    name: 'Mike Johnson',
    role: 'it',
    employeeId: 'IT001',
    department: 'Information Technology',
    phone: '+1 234 567 8903',
    joinDate: '2021-09-05'
  },
  {
    id: '4',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    employeeId: 'ADMIN001',
    department: 'Administration',
    phone: '+1 234 567 8900',
    joinDate: '2020-01-01'
  }
];

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    currentPortal: 'Employee Portal'
  });

  useEffect(() => {
    // Check for stored auth data on app start
    const storedUser = localStorage.getItem('portalUser');
    const storedPortal = localStorage.getItem('currentPortal');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Validate that the user object has required fields
        if (user && user.email && user.role) {
          const defaultPortal = storedPortal || (user.role === 'admin' ? 'Admin Dashboard' : 'Employee Portal');
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            currentPortal: defaultPortal
          });
          localStorage.setItem('currentPortal', defaultPortal);
          console.log(`Restored session for: ${user.name} (${user.email})`);
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('portalUser');
        localStorage.removeItem('currentPortal');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email, password) => {
    console.log(`Login attempt for: ${email}`);
    
    // Trim whitespace and convert to lowercase for comparison
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    // Find user with case-insensitive email comparison
    const user = mockUsers.find(u => u.email.toLowerCase() === cleanEmail);
    
    if (!user) {
      console.log(`User not found for email: ${cleanEmail}`);
      return false;
    }
    
    if (cleanPassword !== 'password123') {
      console.log(`Invalid password for user: ${cleanEmail}`);
      return false;
    }
    
    try {
      // Determine default portal based on role
      const defaultPortal = user.role === 'admin' ? 'Admin Dashboard' : 'Employee Portal';
      
      // Store user data
      localStorage.setItem('portalUser', JSON.stringify(user));
      localStorage.setItem('currentPortal', defaultPortal);
      
      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        currentPortal: defaultPortal
      });
      
      console.log(`Login successful for: ${user.name} (${user.email}) - Role: ${user.role}`);
      
      // Log admin login activity
      if (user.role === 'admin') {
        console.log(`Admin login: ${user.name} (${user.email}) at ${new Date().toISOString()}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    // Log admin logout activity
    if (authState.user?.role === 'admin') {
      console.log(`Admin logout: ${authState.user.name} (${authState.user.email}) at ${new Date().toISOString()}`);
    }
    
    console.log(`Logout for: ${authState.user?.name || 'Unknown user'}`);
    
    localStorage.removeItem('portalUser');
    localStorage.removeItem('currentPortal');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      currentPortal: 'Employee Portal'
    });
  };

  const switchPortal = (portalName) => {
    // Check if user has permission to switch to this portal
    if (!canAccessPortal(portalName)) {
      return false;
    }
    
    // Log admin portal switches
    if (authState.user?.role === 'admin') {
      console.log(`Admin portal switch: ${authState.user.name} switched to ${portalName} at ${new Date().toISOString()}`);
    }
    
    localStorage.setItem('currentPortal', portalName);
    setAuthState(prev => ({
      ...prev,
      currentPortal: portalName
    }));
    return true;
  };

  const canAccessPortal = (portalName) => {
    if (!authState.user) return false;
    
    // Admin has access to all portals
    if (authState.user.role === 'admin') return true;
    
    // Employee portal is accessible to everyone
    if (portalName === 'Employee Portal') return true;
    
    // HR portal only for HR users
    if (portalName === 'HR Portal') return authState.user.role === 'hr';
    
    // IT portal only for IT users
    if (portalName === 'IT Portal') return authState.user.role === 'it';
    
    // Admin Dashboard only for admins
    if (portalName === 'Admin Dashboard') return authState.user.role === 'admin';
    
    return false;
  };

  const getAvailablePortals = () => {
    if (!authState.user) return ['Employee Portal'];
    
    // Admin has access to all portals
    if (authState.user.role === 'admin') {
      return ['Admin Dashboard', 'Employee Portal', 'HR Portal', 'IT Portal'];
    }
    
    const portals = ['Employee Portal'];
    
    if (authState.user.role === 'hr') {
      portals.push('HR Portal');
    } else if (authState.user.role === 'it') {
      portals.push('IT Portal');
    }
    
    return portals;
  };

  const hasRole = (role) => {
    return authState.user?.role === role;
  };

  const isAdmin = () => {
    return authState.user?.role === 'admin';
  };

  const canShowPortalToggle = () => {
    return authState.user?.role === 'hr' || authState.user?.role === 'it' || authState.user?.role === 'admin';
  };

  const logAdminAction = (action, details = {}) => {
    if (authState.user?.role === 'admin') {
      console.log(`Admin action: ${action}`, {
        user: authState.user.name,
        email: authState.user.email,
        timestamp: new Date().toISOString(),
        portal: authState.currentPortal,
        ...details
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      switchPortal,
      hasRole,
      isAdmin,
      canAccessPortal,
      getAvailablePortals,
      canShowPortalToggle,
      logAdminAction
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
