import React from "react";
import ClerkClientProvider from "./clerk-provider";
const MainProvider = ({ children }) => {
  return (
    <ClerkClientProvider>
      {children}
    </ClerkClientProvider>
  );
};

export default MainProvider;
