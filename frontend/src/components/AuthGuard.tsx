import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // TODO: Add authentication logic
  return <>{children}</>;
};

export default AuthGuard; 