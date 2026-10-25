import { useParams } from "react-router";

// /orders/:id/call — the join link sent by POST /api/orders/:id/video-invite
const OrderCallPage = () => {
  const { id } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold">Support call</h1>
      <p className="mt-2 opacity-70">Order {id?.slice(0, 8)}</p>
    </section>
  );
};

export default OrderCallPage;
