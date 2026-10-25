import { useParams } from "react-router";

// /products/:slug — backend: GET /api/products/:slug
const ProductPage = () => {
  const { slug } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold">Product</h1>
      <p className="mt-2 opacity-70">Slug: {slug}</p>
    </section>
  );
};

export default ProductPage;
