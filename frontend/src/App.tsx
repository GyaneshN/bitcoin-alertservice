import { CardDemo } from "./components/Card";
import Processed from "./components/Processed";
import { ModeToggle } from "./components/mode-toogle";
// import { MainContext } from "./context/State";

const App = () => {

  return (
    <div>
      <div className="flex justify-end p-5">
        <ModeToggle />
      </div>
      <div className="md:flex justify-around mt-[50px] p-10">
        <div className="flex-1 max-w-1/2 flex justify-center">
          <CardDemo />
        </div>
        <div className="flex-1 max-w-1/2">
          <Processed />
        </div>
      </div>
    </div>
  );
};

export default App;
