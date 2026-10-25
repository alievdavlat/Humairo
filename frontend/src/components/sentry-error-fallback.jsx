import { Link } from "react-router";

const SentryErrorFallback = () => {
  return (
    <div className="mx-auto max-w-md rounded-box border border-base-300 bg-base-100 p-8 text-center">
      <p>Something went wrong. The error was reported.</p>
      <Link to="/">Back to shop</Link>
    </div>
  );
};

export default SentryErrorFallback;
