import express from "express";
import cors from "cors";
import { uploadVideo } from "./middlewares/multer.middlewares";
import { getBulkVideos, getSingleVideo, uploadToS3 } from "./uploads3";
import { createClient } from "redis";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv";
import { ConnectToDb } from "./connection";
import { router as UserRoutes } from "./controllers/User.controller";
import { router as VideoRoutes } from "./controllers/Video.controller";
import cookieParser from "cookie-parser";
import axios from "axios";
import { isUserLoggedIn } from "./middlewares/authenticate.middlewares";
import fs from "fs";
import Video from "./models/Video.model";
import { User } from "./models/User.model";

const app = express();

dotenv.config();


app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());


ConnectToDb();

const publisher = createClient({
  url: process.env.URL,
});

publisher.on("error", (err) => {
  console.log(err);
});

publisher.connect();

//routes
app.use("/user", UserRoutes);
app.use("/upload", VideoRoutes);

const ecsclient = new ECSClient({
  region: process.env.REGION ?? "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

const config = {
  CLUSTER: "arn:aws:ecs:ap-south-1:211125556897:cluster/video",
  TASK: "arn:aws:ecs:ap-south-1:211125556897:task-definition/video:1",
};

(async () => {
  const response = await getSingleVideo(
    "1719056643963-74139872",
    process.env.BUCKET_NAME || ""
  );
  console.log(response);
})();

app.get("/",(req,res)=>{
  res.send("hello world")
})

app.post(
  "/upload",
  isUserLoggedIn,
  uploadVideo.single("video"),
  async (req, res) => {
    const key: any = req.file?.filename.split(".")[0];

    const filePath: any = req.file?.path;

    // @ts-ignore
    const userId = req.user.id;

    const postdata = {
      userId,
      Key: key,
      redis_id: String(req.body.redis_id),
    };

    await publisher.set(`redis_${req.body.redis_id}`, "Uploading");

    const response = await axios.post(
      `${process.env.BACKEND_URL}/upload/newVideo`,
      postdata
    );

    if (response.data.success) {
      const result: any = await uploadToS3(key, filePath);

      console.log(result);

      if (result) {
        // await publisher.set(`redis_${req.body.redis_id}`, "Uploaded");

        console.log(req.body.redis_id);

        const url = await getSingleVideo(
          String(key),
          process.env.BUCKET_NAME || ""
        );

        await Video.findOneAndUpdate(
          { redis_id: req.body.redis_id },
          { originalVideo: url }
        );

        await publisher.set(`redis_${req.body.redis_id}`, "Converting");

        const cmd = new RunTaskCommand({
          cluster: config.CLUSTER,
          taskDefinition: config.TASK,
          launchType: "FARGATE",
          count: 1,
          networkConfiguration: {
            awsvpcConfiguration: {
              assignPublicIp: "ENABLED",
              subnets: [
                "subnet-0c3c8ac43f6e053db",
                "subnet-0b5afeea9a98155de",
                "subnet-06e2e7eeb5a9c3513",
          
              ],
              securityGroups: ["sg-054376a96279e2a5d"],
            },
          },
          overrides: {
            containerOverrides: [
              {
                name: "video",
                environment: [
                  { name: "KEY", value: key },
                  { name: "VIDEO_LINK", value: url },
                  { name: "REDIS_KEY", value: req.body.redis_id },
                ],
              },
            ],
          },
        });

        await ecsclient.send(cmd);

        fs.unlink(filePath || "", (err) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("unlinked successfully");
        });

        res.json({
          success: true,
        });
      } else {
        res.json({
          success: false,
        });
      }
    }
  }
);

app.get("/getRedisKeyStatus", async (req, res) => {
  const { redis_id } = req.query;

  console.log(redis_id);

  const status = await publisher.get(`redis_${redis_id}`);

  res.json({ status });
});

app.post("/UpdateStatus", async (req, res) => {
  const { redis_id } = req.body;

  try {
    await Video.findOneAndUpdate({ redis_id }, { status: "Uploaded" });
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});

app.listen(3000);