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
// import { LoaderIcon } from "lucide-react";
import { MainContext } from "@/context/State";

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

type CardProps = React.ComponentProps<typeof Card>;

export function CardDemo({ className, ...props }: CardProps) {
  const { Loading, setLoading, setVideos , file , setFile} = useContext(MainContext);

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
    const form = new FormData();

    const url = "http://localhost:3000/upload";

    form.append("video", file);

    setLoading(true);

    try {

      window.scrollTo({ top: 0, behavior: "smooth" });
      
      const data = await fetch(url, {
        method: "POST",
        body: form,
      });

      const { links } = await data.json();

      setVideos(links);

      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.log(error);
    }
  };
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
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
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
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
  );
}
