import ClerkClientProvider from "./clerk-provider";
import ClientQueryProvider from "./query-provider";
import { SentryUserSync } from "../sentry-user-sync";

const MainProvider = ({ children }) => {
  return (
    <ClientQueryProvider>
      <ClerkClientProvider>
        <SentryUserSync />
        {children}
      </ClerkClientProvider>
    </ClientQueryProvider>
  );
};

export default MainProvider;
