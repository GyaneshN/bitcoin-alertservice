import { createContext, useState } from "react";

export const MainContext = createContext(null);

export const MainContextProvider = ({ children }) => {

  const [Loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [Videos, setVideos] = useState([]);

  return (
    <MainContext.Provider value={{ Loading, setLoading, Videos, setVideos,file,setFile }}>
      {children}
    </MainContext.Provider>
  );
};
