import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <section className="text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 opacity-70">This page does not exist.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Go home
      </Link>
    </section>
  );
};

export default NotFoundPage;
