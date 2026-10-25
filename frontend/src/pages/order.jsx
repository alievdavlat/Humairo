import { Link, useParams } from "react-router";

// /orders/:id — backend: GET /api/orders/:id
const OrderPage = () => {
  const { id } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold">Order {id?.slice(0, 8)}</h1>
      <Link to={`/orders/${id}/call`} className="btn btn-outline btn-sm mt-4">
        Join support call
      </Link>
    </section>
  );
};

export default OrderPage;
