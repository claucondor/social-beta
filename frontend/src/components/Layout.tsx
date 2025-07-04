import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-950 text-glitch-primary">
      <header className="border-b border-glitch-primary/30 p-4">
        <h1 className="font-cyber">LA RESISTENCIA</h1>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout; 