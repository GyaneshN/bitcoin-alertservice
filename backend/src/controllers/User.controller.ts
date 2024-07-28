import express from "express";

import { User } from "../models/User.model";

import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

export const router = express.Router();



router.post("/register", async (req, res) => {

    const {email,password} = req.body;

  if (!email || !password)
    return res.json({
      success: false,
      message: "Please provide all the field",
    });

  const exist = await User.findOne({ email });

  if (exist)
    return res.json({
      success: false,
      message: "User already exist",
    });

  const newUser = await User.create({
    email,
    password,
  });

  if (newUser) {

    await newUser.save();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, password: newUser.password },
      process.env.JWT_SECRET || ""
    );

    res.cookie("userToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
    });

    return res.json({
      success: true,
      User: newUser,
    });
  }

  res.json({
    success: false,
    message: "Some error occured",
  });
});
 
router.get("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({
      success: false,
      message: "please provide all the field",
    });

  const UserExist = await User.findOne({ email });

  if (UserExist) {
    const passwordExist = UserExist.password == password;

    if (passwordExist) {
      return res.json({
        success: true,
        User: UserExist,
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } else {
    return res.json({
      success: false,
      message: "Invalid credentials",
    });
  }
}); 