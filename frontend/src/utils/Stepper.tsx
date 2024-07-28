import React, { useState } from "react";
// import { CheckIcon } from "@radix-ui/react-icons";
import { Check } from "lucide-react";

interface Steps {
  step: number;
  status: string;
}

const Stepper = ({ mainStep }) => {
  const [currentSteps, setcurrentSteps] = useState(mainStep + 1);

  const StepsData: Steps[] = [
    {
      step: 1,
      status: "Uploading",
    },
    {
      step: 2,
      status: "Processing",
    },
    {
      step: 3,
      status: "Uploaded",
    },
  ];

  console.log(currentSteps);

  return (
    <div>
      <div>
        {StepsData.map(({ step, status }) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-[40px] h-[40px] rounded-full border-2 flex justify-center items-center ${
                  currentSteps > step ? "bg-white" : "border-white"
                }`}
              >
                {currentSteps > step ? <Check color="black" /> : step}
              </div>
              <p>{status}</p>
            </div>
            {step != 3 && (
              <div
                className={`h-[50px] w-[2px] ml-4 mb-2 rounded-full ${
                  currentSteps > step ? "bg-white" : "bg-gray-500"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
