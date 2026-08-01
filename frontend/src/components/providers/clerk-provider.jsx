import React from "react";
import { ClerkProvider } from "@clerk/react";
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log(PUBLISHABLE_KEY, "PUBLISHABLE_KEY");
if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in the root .env (passed via docker-compose) or in frontend/.env",
  );
}

const ClerkClientProvider = ({ children }) => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
};

export default ClerkClientProvider;
