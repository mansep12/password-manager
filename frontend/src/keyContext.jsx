import React, { createContext, useState } from "react";

// Create Context
export const KeyContext = createContext();

// Create Provider Component
export const KeyProvider = ({ children }) => {
  const [derivedKey, setDerivedKey] = useState(null);

  return (
    <KeyContext.Provider value={{ derivedKey, setDerivedKey }}>
      {children}
    </KeyContext.Provider>
  );
};
