import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import SentryErrorFallback from "./sentry-error-fallback.jsx";

const RouteError = () => {
  const error = useRouteError();
  const isHttpError = isRouteErrorResponse(error);

  useEffect(() => {
    if (!isHttpError) Sentry.captureException(error);
  }, [error, isHttpError]);

  if (!isHttpError) return <SentryErrorFallback />;

  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="mb-2 text-2xl font-bold">
        {error.status} {error.statusText}
      </h1>
      <p className="mb-6 opacity-70">{error.data}</p>
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
};

export default RouteError;
