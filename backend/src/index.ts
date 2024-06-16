import express from "express";
import cors from "cors";
import { uploadVideo } from "./middlewares/multer.middlewares";
import { getBulkVideos, getSingleVideo, uploadToS3 } from "./uploads3";
import { createClient } from "redis";
import fs from "fs";
import { exec } from "child_process";

const app = express();

const publisher = createClient({
  url: process.env.URL,
});

app.use(cors());

app.use(express.json());

publisher.connect();

// (async () => {
//   const url = await getVideoUrl("1717917394427-343266241", "output-decoded");
//   console.log(url);
// })();

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

    const cmd = `docker run -e KEY="${key}" -e VIDEO_LINK="${url}" newimg39`;

    await publisher.set(`${key}_redis`, "false");

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command execution resulted in errors: ${stderr}`);
        return;
      }
    });

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
