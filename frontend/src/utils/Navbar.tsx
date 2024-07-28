import React from "react";
import { ModeToggle } from "@/components/mode-toogle";
import { Link, redirect } from "react-router-dom";

const data = [
  {
    link: "Home",
    redirect: "/",
    key: 1,
  },
  {
    link: "register",
    redirect: "/register",
    key: 2,
  },
  {
    link: "process",
    redirect: "/process",
    key: 3,
  },
  {
    link: "AllVideos",
    redirect: "/AllVideos",
    key: 4,
  },
];

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-5 absolute w-full top-0">
      <div className="flex gap-14">
        {data.map(({ link, redirect, key }) => (
          <div key={key} className="flex gap-2 items-center">
            <Link to={redirect}>{link}</Link>
            {link == "process" && (
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
            )}
          </div>
        ))}
      </div>
      <div>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
