import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

interface JwtPayload {
  id: string;
}

export const isUserLoggedIn = async (req: any, res: any, next: any) => {
  try {

    const authToken = req.headers["authorization"].split(" ")[1];
    
    if (!authToken)
      return res.json({
        success: false,
        message: "Please Logged in",
      });

    const user = jwt.verify(
      authToken,
      process.env.JWT_SECRET || ""
    ) as JwtPayload;

    const isUserExist = await User.findById(user.id);

    console.log(isUserExist);
    

    if (isUserExist) {

      req.user = { id: user.id }

      return next();
    }

    return res.json({
      success: false,
      message: "Some Error occured",
    });
  } catch (error) {
    console.log(true);
    return res.json({
      success: false,
      message: error,
    });
  }
};
