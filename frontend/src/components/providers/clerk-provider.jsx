import { ClerkProvider } from "@clerk/react";
import { useNavigate } from "react-router";
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log(PUBLISHABLE_KEY, "PUBLISHABLE_KEY");
if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in the root .env (passed via docker-compose) or in frontend/.env",
  );
}

// Rendered inside the router (root layout), so Clerk's redirects are client-side navigations.
const ClerkClientProvider = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkClientProvider;
