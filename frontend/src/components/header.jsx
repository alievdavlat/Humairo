import {
  Show,
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/react";
import { Link, NavLink } from "react-router";
import { useGetQuery } from "../hooks/use-fetch";
const navLinkClass = ({ isActive }) => (isActive ? "menu-active" : "");

const Header = () => {
  const { getToken, isSignedIn } = useAuth();
  const { data } = useGetQuery(
    ["me"],
    "/api/users/me",
    { getToken },
    isSignedIn,
  );

  console.log(data, "data");

  return (
    <header className="navbar bg-base-200 px-4 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold">
          Humairo
        </Link>
      </div>

      <nav className="flex items-center gap-2">
        <ul className="menu menu-horizontal gap-1">
          <li>
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/cart" className={navLinkClass}>
              Cart
            </NavLink>
          </li>
          <Show when="signed-in">
            <li>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
            </li>
          </Show>
        </ul>

        {/* <Show> renders no element of its own, so classes go on the children */}
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-sm">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-outline btn-sm">Sign up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </nav>
    </header>
  );
};

export default Header;
