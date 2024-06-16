import { useContext } from "react";
import { SkeletonCard } from "./Skleton";
import { MainContext } from "@/context/State";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ReactPlayer from "react-player";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";

const Processed = () => {
  const { Loading, Videos, file } = useContext(MainContext);

  const handleDownload = (link : string) => {
    // Replace with your video URL
    const videoUrl = link;

    // Create a temporary anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = videoUrl;
    downloadLink.download = "downloaded-video.mp4";
    document.body.appendChild(downloadLink);

    // Trigger the download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
  };

  console.log(file);

  const Quality = ["", "240p", "360p", "480p", "720p"];

  console.log(Videos);

  return (
    <div>
      {Loading ? (
        <div className="flex flex-wrap gap-5">
          {Array(3)
            .fill(null)
            .map(() => (
              <SkeletonCard />
            ))}
        </div>
      ) : (
        !file && (
          <div className="flex justify-center items-center h-full">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Select a video
            </h2>
          </div>
        )
      )}

      <div className="flex sm:justify-center sm:w-full sm:mt-10 flex-wrap gap-3 mb-9">
        {Videos.length > 0 &&
          Videos.map(
            (link: string, index) =>
               (
                <Card className="w-2/5 relative p-0 overflow-hidden">
                  <CardContent className="p-0">
                    <ReactPlayer
                      url={link}
                      width="100%"
                      height="100%"
                      controls
                    />
                  </CardContent>
                  <CardFooter className="flex items-center gap-5 mt-3">
                    <Badge variant="destructive">{Quality[index]}</Badge>
                    <Button onClick={()=>handleDownload(link)}>
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              )
          )}
      </div>
    </div>
  );
};

export default Processed;
