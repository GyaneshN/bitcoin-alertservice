import express from "express";
import Video from "../models/Video.model";
import { isUserLoggedIn } from "../middlewares/authenticate.middlewares";
import { getBulkVideos, getSingleVideo } from "../uploads3";

export const router = express.Router();

router.post("/newVideo", async (req, res) => {
  try {
    const newVideo = new Video(req.body);

    await newVideo.save();

    return res.json({
      success: true,
      status: "Uploading",
      data: newVideo,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getProcess", async (req, res) => {
  const process = await Video.find({
    userId: req.query.id,
    $or: [{ status: "Uploading" }, { status: "Processing" }],
  });

  return res.json({
    success: true,
    queue: process,
  });
});

router.get("/getAllVideos", isUserLoggedIn, async (req, res) => {
  // @ts-ignore
  const id = req.user.id;

  const Videos = await Video.find({ userId: id, status: "Uploaded" });

  return res.json({
    success: true,
    Videos,
  });
});

router.get("/getGeneratedVideos", async (req, res) => {
  const { Id } = req.query;

  const originalVideo = await getSingleVideo(
    String(Id),
    process.env.BUCKET_NAME || ""
  );

  const outputVideos = await getBulkVideos(
    String(Id),
    process.env.OUTPUT_BUCKET || ""
  );

  let audiofiles = null;

  // @ts-ignore
  // console.log(outputVideos.length);
  // @ts-ignore
  if (outputVideos.length >= 5) {
    // @ts-ignore
    audiofiles = outputVideos[0];
    outputVideos?.shift();
  }

  res.json({ originalVideo, outputVideos, audiofiles });
});
