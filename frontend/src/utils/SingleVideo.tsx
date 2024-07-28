import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player/lazy";
import { Badge } from "@/components/ui/badge";
import { MainContext } from "@/context/State";

const SingleVideo = () => {
  const { VideoId } = useParams();
  const [originalVideo, setOriginalVideo] = useState<string>("");
  const [decodedVideo, setDecodedVideo] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const quality = ["240p", "360p", "480p", "720p"];
  const { BACKEND_URL } = useContext(MainContext);

  useEffect(() => {
    const Videos = async () => {
      const { data } = await axios.get(
        `${BACKEND_URL}/upload/getGeneratedVideos`,
        {
          params: {
            Id: VideoId,
          },
        }
      );

      setAudioFile(data.audiofiles);
      setOriginalVideo(data.originalVideo);
      setDecodedVideo(data.outputVideos);
    };
    Videos();
  }, []);

  return (
    <div>
      <div className="mt-[100px] p-5">
        <div className="my-5">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-5">
            Your Video
          </h4>
          <ReactPlayer url={originalVideo} controls height={"auto"} />
        </div>
        {audioFile && (
          <div className="my-5">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-5">
              Audio File
            </h4>
            <audio controls>
              <source src={audioFile} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-5">
            Transcoded Videos
          </h4>
          <div className="flex flex-wrap gap-10">
            {decodedVideo.map((url, index) => (
              <div className="w-1/4" key={url}>
                <ReactPlayer url={url} controls width="100%" height="auto" />
                <Badge>{quality[index]}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleVideo;
