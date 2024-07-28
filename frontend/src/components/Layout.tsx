import { MainContext } from "@/context/State";
import Navbar from "@/utils/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
    

  return (
    <div className="h-full">
      <Navbar />
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;
