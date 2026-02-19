import React from 'react';

export const WiserLogo = () => {
  return (
    <div className="flex items-center justify-center">
      {/* Light Mode Logo */}
      <img
        src="/logo-light.png" 
        alt="Wiser Logo"
        className="block dark:hidden h-12 w-auto" 
      />
      {/* Dark Mode Logo */}
      <img
        src="/logo-dark.png" 
        alt="Wiser Logo"
        className="hidden dark:block h-12 w-auto" 
      />
    </div>
  );
};