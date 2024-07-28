import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MainContext } from "@/context/State";
import VideoCard from "@/utils/Videocard";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Process = () => {
  const { getUserId, getToken, BACKEND_URL } = useContext(MainContext);

  const [queue, setQueue] = useState([]);

  const getProcess = async () => {
    const token = getToken();

    const { id } = getUserId(token);

    const { data } = await axios.get(`${BACKEND_URL}/upload/getProcess`, {
      params: { id },
    });
    setQueue(data.queue);
  };

  useEffect(() => {
    getProcess();
  }, []);

  console.log(queue);

  return (
    <div>
      <div className="pt-[100px]">
        <div className="mx-10">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Queue
          </h3>
          {queue.length > 0 ? (
            <div className="mt-8">
              <div className="flex flex-wrap gap-5">
                {queue.map(({ Key, redis_id }) => (
                  <VideoCard
                    key={redis_id}
                    video_id={Key}
                    redis_id={redis_id}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-[100px]">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                No video is in Processing
              </h4>
              <Link to={"/upload"} className="mt-5">
                <Button>Process Video</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Process;
