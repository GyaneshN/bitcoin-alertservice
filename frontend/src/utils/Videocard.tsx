import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Stepper from "./Stepper";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "@/context/State";

interface VideoCardProps {
  className?: string; // Optional class name
  video_id: string; // Video ID prop
  redis_id: string; // Redis ID prop
}

const VideoCard: React.FC<VideoCardProps> = ({
  className,
  video_id,
  redis_id,
}) => {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [keyForRerender, setKeyForRerender] = useState(0); // Add key for forcing re-render
  const [videoStatus, setVideoStatus] = useState(true);
  const intervalRef = useRef(null);
  const { BACKEND_URL } = useContext(MainContext);

  const fetchStatus = async () => {
    const res = await axios.get(`${BACKEND_URL}/getRedisKeyStatus`, {
      params: { redis_id },
    });

    const status = res.data.status;

    setCurrentSteps((prevSteps) => {
      if (status === "Uploading") return 0;
      else if (status === "Processing") return 1;
      else if (status === "Converting") return 2;
      else return 3;
    });

    if (status == "Uploaded") {
      const res = await axios.post(`${BACKEND_URL}/UpdateStatus`, {
        redis_id,
      });
      if (res.data.success) {
        setVideoStatus(false);
        clearInterval(intervalRef.current);
      }
    }

    setKeyForRerender((prevKey) => prevKey + 1); // Force re-render
  };

  useEffect(() => {
    fetchStatus();

    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // console.log()

  return (
    <Card key={keyForRerender} className={cn("w-[380px]", className)}>
      <CardHeader>
        <CardTitle>#{video_id}</CardTitle>
        <CardDescription className="mt-3">
          <div className="flex items-center gap-2">
            Status :
            {videoStatus ? (
              <span className="text-yellow-500">Pending</span>
            ) : (
              <span className="text-green-500">Completed</span>
            )}
          </div>
        </CardDescription>
        {/* <CardDescription> {moment(doc.timestamp).format('YYYY-MM-DD HH:mm:ss')}</CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-4">
        <Stepper mainStep={currentSteps} />
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={videoStatus ? true : false}>
          <Check className="mr-2 h-4 w-4" /> Proceed
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
