// react-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/Item';

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (jwtToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwt = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
console.log("payload",jsonPayload);
    // The 'decoded' object should now directly contain 'roles' from the Java backend
    const decoded: { sub: string; roles?: string[] } = JSON.parse(jsonPayload);
console.log("decode",decoded);
    // IMPORTANT: Check the exact structure of roles coming from Java.
    // Spring Security's GrantedAuthority.getAuthority() returns "ROLE_VIEWER", "ROLE_RECOMMENDER".
    // We expect 'decoded.roles' to be an array like ["ROLE_RECOMMENDER", "ROLE_VIEWER"].
    const extractedRoles = Array.isArray(decoded.roles) ? decoded.roles : [];
console.log("roles",extractedRoles);
    return {
      username: decoded.sub,
      roles: extractedRoles, // Use the extracted roles directly
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const decodedUser = decodeJwt(token);
      setUser(decodedUser);
      // localStorage.setItem('jwtToken', token); // Already handled in login/logout, or keep for initial load
    } else {
      setUser(null);
      // localStorage.removeItem('jwtToken'); // Already handled in login/logout
    }
  }, [token]);

  const login = (jwtToken: string) => {
    setToken(jwtToken);
    localStorage.setItem('jwtToken', jwtToken); // Ensure token is always persisted on login
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('jwtToken'); // Ensure token is removed on logout
  };

  // Corrected hasRole logic to correctly match roles with 'ROLE_' prefix
  const hasRole = (role: string): boolean => {
    // Convert the input role to uppercase and prepend "ROLE_" if not already there,
    // to match what Spring Security puts in the JWT claims.
    const prefixedRole = role.startsWith('ROLE_') ? role : `ROLE_${role.toUpperCase()}`;
    return user?.roles?.includes(prefixedRole) || false;
  };

  // Add `hasRole` to the dependency array to satisfy the ESLint warning.
  // It won't change often, but explicitly including it is good practice.
  const contextValue = React.useMemo(() => ({
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    hasRole,
  }), [token, user, hasRole]); // ADDED: hasRole to dependency array

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};