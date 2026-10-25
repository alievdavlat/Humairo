import { Show, SignInButton } from "@clerk/react";
import { Outlet } from "react-router";

// Layout route for pages that need a signed-in user. This only hides the UI;
// the backend still enforces auth on every API call.
const RequireAuth = () => {
  return (
    <Show
      when="signed-in"
      fallback={
        <div className="card bg-base-200 mx-auto max-w-md p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">Sign in required</h2>
          <p className="mb-4 opacity-70">Please sign in to see this page.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary">Sign in</button>
          </SignInButton>
        </div>
      }
    >
      <Outlet />
    </Show>
  );
};

export default RequireAuth;
