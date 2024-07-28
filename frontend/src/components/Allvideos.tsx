import { MainContext } from "@/context/State";
import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import moment from "moment";

const Allvideos = () => {
  const { getProcessedVideos, getToken } = useContext(MainContext);
  const [Videos, setVideos] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const res = await getProcessedVideos(token);

      setVideos(res.data.Videos);
    };

    fetchData();
  }, []);

  console.log(Videos);

  return Videos.length > 0 ? (
    <div className="flex flex-wrap mt-[100px] p-5 gap-10">
      {Videos.map(({ Key }) => (
        <Link className="w-1/4" to={`/video/${Key}`}>
          <Card>
            <CardHeader>
              <CardTitle>#{Key}</CardTitle>
              <CardDescription>
                {moment("20111031", "YYYYMMDD").fromNow()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  ) : (
    <div className="flex justify-center mt-[100px]">
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        You have no Videos
      </h4>
    </div>
  );
};

export default Allvideos;
