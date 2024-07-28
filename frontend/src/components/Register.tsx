import React, { useContext, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MainContext } from "@/context/State";

const Register = () => {
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");
  const [Loading, setLoading] = useState(false);

  const { getToken, BACKEND_URL } = useContext(MainContext);

  const navigate = useNavigate();

  const notify = (message: string, success: boolean) => {
    if (success) {
      toast.success(message);
      setTimeout(() => {
        return navigate("/");
      }, 1000);
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    setLoading(true);

    const token = getToken();

    if (token) navigate("/");

    setLoading(false);
  }, []);

  const registerUser = async () => {
    const data = await fetch(`${BACKEND_URL}/user/register`, {
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      credentials: "include",
      method: "POST",
    });
    const jsondata = await data.json();
    if (jsondata.success == true) notify("Registrantion completed", true);
    else notify(jsondata.message, false);
  };

  return (
    !Loading && (
      <div className="h-full flex justify-center items-center">
        <div className="w-[400px] px-6 py-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Create an account
          </h3>
          <Input
            type="email"
            className="my-5 w-full"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            className="w-full"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={registerUser} className="w-full my-5">
            Register
          </Button>
          <Toaster position="top-center" reverseOrder={false} />
        </div>
      </div>
    )
  );
};

export default Register;
