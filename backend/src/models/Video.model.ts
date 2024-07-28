import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    redis_id: {
      type: String,
      required: true,
    },
    Key: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Uploading", "Processing", "Uploaded"],
      default: "Uploading",
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("Video", VideoSchema);

export default Video;
