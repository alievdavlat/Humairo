import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ClientQueryProvider = ({ children }) => {
  // Created once: a new client on every render would drop the whole query cache.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ClientQueryProvider;
