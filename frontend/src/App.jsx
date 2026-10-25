import { Outlet } from "react-router";
import MainProvider from "./components/providers/main-provider.jsx";
import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";

function App() {
  return (
    <MainProvider>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">
        <Outlet />
      </main>

      <Footer />
    </MainProvider>
  );
}

export default App;
