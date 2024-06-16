import express from "express";
import cors from "cors";
import { uploadVideo } from "./middlewares/multer.middlewares";
import { getBulkVideos, getSingleVideo, uploadToS3 } from "./uploads3";
import { createClient } from "redis";
import fs from "fs";
import { exec } from "child_process";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv";

const app = express();

const publisher = createClient({
  url: process.env.URL,
});

app.use(cors());

app.use(express.json());

publisher.connect();

dotenv.config();

const ecsclient = new ECSClient({
  region: process.env.REGION ?? "",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

const config = {
  CLUSTER: "arn:aws:ecs:ap-south-1:675754445188:cluster/builder-cluster",
  TASK: "arn:aws:ecs:ap-south-1:675754445188:task-definition/transcoder-task",
};

app.post("/upload", uploadVideo.single("video"), async (req, res) => {
  const key = req.file?.filename.split(".")[0];

  const filePath = req.file?.path;

  const result: any = await uploadToS3(key, filePath);

  console.log(result);

  if (result) {
    const url = await getSingleVideo(
      String(key),
      process.env.BUCKET_NAME || ""
    );

    const cmd = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp : "ENABLED",
          subnets: [
            "subnet-081bcb807434034eb",
            "subnet-03b50c3631ec557ac",
            "subnet-04d255673d7003d5b",
          ],
          securityGroups:["sg-0d9f7ef5a1379aec7"]
        },
      },
      overrides:{
        containerOverrides:[
          {
            name : "transcoder-image",
            environment : [
              {name : "KEY" , value : key},
              {name : "VIDEO_LINK", value : url}
            ]
          }
        ]
      }
    });

    await publisher.set(`${key}_redis`, "false");

    await ecsclient.send(cmd);

    let intervalId = setInterval(async () => {
      const redis_key = await publisher.get(`${key}_redis`);
      if (redis_key == "true") {
        const links = await getBulkVideos(
          String(key), 
          process.env.OUTPUT_BUCKET || ""
        );
        console.log(links);
        res.json({ links });
        clearInterval(intervalId);
      } else {
        console.log("false");
      }
    }, 5000);
  } else {
    res.json({
      success: false,
    });
  }
});

app.listen(3000);
