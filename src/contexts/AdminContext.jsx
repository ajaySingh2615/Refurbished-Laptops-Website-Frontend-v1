import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [lowStockCount, setLowStockCount] = useState(0);

  const value = {
    lowStockCount,
    setLowStockCount,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
