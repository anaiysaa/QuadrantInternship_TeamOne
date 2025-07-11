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
  }
];

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth data on app start
    const storedUser = localStorage.getItem('portalUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('portalUser');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email, password) => {
    // Mock authentication - in real app, this would be an API call
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'password123') {
      localStorage.setItem('portalUser', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    }
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem('portalUser');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const hasRole = (role) => {
    return authState.user?.role === role;
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      hasRole
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