import { CheckIcon } from "@radix-ui/react-icons";

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
import { ChangeEvent, useContext, useState } from "react";
import { MainContext } from "@/context/State";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuid } from "uuid";

const notifications = [
  {
    title: "Uploading",
  },
  {
    title: "Proceessing",
  },
  {
    title: "Completed",
  },
];

type CardProps = React.ComponentProps<typeof Card>;

export function CardDemo({ className, ...props }: CardProps) {
  const navigate = useNavigate();

  const { Loading, setLoading, file, setFile, getToken, BACKEND_URL } =
    useContext(MainContext);

  const [fileLink, setFileLink] = useState<string | null>(null);

  const Addfile = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    setFile(selectedFile);

    if (selectedFile) {
      const videoUrl = URL.createObjectURL(selectedFile);
      setFileLink(videoUrl);
    }
  };

  const UploadVideo = async () => {
    const token = getToken();

    if (!token) navigate("/register");

    const redis_id = uuid();

    const form = new FormData();

    form.append("video", file);

    form.append("redis_id", redis_id);

    setLoading(true);

    const url = `${BACKEND_URL}/upload`;

    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    };

    try {
      const { data } = await axios.post(url, form, { headers });

      console.log(data);

      if (data.success) {
        navigate("/process");
      } 


      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.log(error);
    }
  };
  return (
    <div className="flex justify-center">
      <Card className={cn("w-[380px] mt-[100px] mb-10", className)} {...props}>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>We work on three steps</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            {fileLink && (
              <video width="320" height="240" controls autoPlay>
                <source src={fileLink} type="video/mp4" />
                Error Message
              </video>
            )}

            <div className="mt-10">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                >
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center p-5 gap-2">
          <div className="relative w-full">
            <Button className="w-full flex">
              <CheckIcon className="mr-2 4h-4 w-" /> Select File
              <input
                onChange={(e) => Addfile(e)}
                type="file"
                accept="video/*"
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          </div>
          <Button
            className="w-full"
            disabled={!file || Loading ? true : false}
            onClick={UploadVideo}
          >
            <CheckIcon className="mr-2 h-4 w-4" /> Upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
