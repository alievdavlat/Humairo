import { Link, useSearchParams } from "react-router";

// /checkout/return?checkout_id=... — Polar's success_url after payment
const CheckoutReturnPage = () => {
  const [searchParams] = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");

  return (
    <section className="text-center">
      <h1 className="text-2xl font-bold">Thank you for your order!</h1>
      <p className="mt-2 opacity-70">Checkout: {checkoutId ?? "unknown"}</p>
      <Link to="/orders" className="btn btn-primary mt-6">
        View my orders
      </Link>
    </section>
  );
};

export default CheckoutReturnPage;
